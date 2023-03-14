import { DOCUMENT } from '@angular/common';
import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  KtdGridComponent,
  KtdGridLayout,
  KtdGridLayoutItem,
  ktdTrackById,
} from '@katoid/angular-grid-layout';
import { fromEvent, merge, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import '@carbon/styles/css/styles.css';
import '@carbon/charts/styles.css';
import { ktdArrayRemoveItem } from './utils/utils';
import { SimpleBarComponent } from './components/simple-bar/simple-bar.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild(KtdGridComponent, { static: true }) grid!: KtdGridComponent;
  title = 'angular-grid-layout-app';
  cols: number = 6;
  rowHeight: number = 150;
  layout: any = [
    { id: '0', x: 0, y: 0, w: 3, h: 3 , component: SimpleBarComponent},
    { id: '1', x: 3, y: 0, w: 3, h: 3 ,component: LineChartComponent},
    { id: '2', x: 0, y: 3, w: 3, h: 3, minW: 2, minH: 3, component: DonutChartComponent},
    { id: '3', x: 3, y: 3, w: 3, h: 3, minW: 2, maxW: 3, minH: 2, maxH: 5, component: SimpleBarComponent },
  ];
  trackById = ktdTrackById;
  private resizeSubscription!: Subscription;
  layoutSizes: { [id: string]: [number, number] } = {};

  data = [
    {
      "group": "Qty",
      "value": 65000
    },
    {
      "group": "More",
      "value": 29123
    },
    {
      "group": "Sold",
      "value": 35213
    },
    {
      "group": "Restocking",
      "value": 51213
    },
    {
      "group": "Misc",
      "value": 16932
    }
  ];
  options = {
    "title": "Vertical simple bar (discrete)",
    "axes": {
      "left": {
        "mapsTo": "value"
      },
      "bottom": {
        "mapsTo": "group",
        "scaleType": "labels"
      }
    },
    "height": "400px"
  };


  constructor(@Inject(DOCUMENT) public document: Document) {}

  ngOnInit() {
    this.resizeSubscription = merge(
      fromEvent(window, 'resize'),
      fromEvent(window, 'orientationchange')
    )
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.grid.resize();
        this.calculateLayoutSizes();
      });
  }

  private calculateLayoutSizes() {
    const gridItemsRenderData = this.grid.getItemsRenderData();
    this.layoutSizes = Object.keys(gridItemsRenderData).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: [
          gridItemsRenderData[cur].width,
          gridItemsRenderData[cur].height,
        ],
      }),
      {}
    );
  }

  onLayoutUpdated(layout: any) {
    console.log('on layout updated', layout);

    this.layout = layout;
    // this.options
  }

  /** Adds a grid item to the layout */
  addItemToLayout() {
    const maxId = this.layout.reduce(
      (acc:any, cur:any) => Math.max(acc, parseInt(cur.id, 10)),
      -1
    );
    const nextId = maxId + 1;

    const newLayoutItem: KtdGridLayoutItem = {
      id: nextId.toString(),
      x: 0,
      y: 0,
      w: 2,
      h: 2,
    };

    // Important: Don't mutate the array, create new instance. This way notifies the Grid component that the layout has changed.
    this.layout = [newLayoutItem, ...this.layout];
  }

  stopEventPropagation(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  /** Removes the item from the layout */
  removeItem(id: string) {
    // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
    this.layout = ktdArrayRemoveItem(this.layout, (item:any) => item.id === id);
  }

  ngOnDestroy() {
    this.resizeSubscription.unsubscribe();
  }
}
