import { Component, ViewChild, ElementRef, OnInit, NgZone, Renderer2, HostListener } from '@angular/core';
import { Point } from '../models/point';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  template: `<canvas #canvas></canvas>`
})
export class AppComponent implements OnInit {
  title = 'Bezier';

  // Declare height and width variables
  scrHeight:any;
  scrWidth:any;

  @HostListener('window:resize', ['$event'])
  getScreenSize(_event?: undefined) {
        this.scrHeight = window.innerHeight - 1;
        this.scrWidth = window.innerWidth - 281;
        console.log(this.scrHeight, this.scrWidth);
  }

  // Constructor
  constructor() {
      this.getScreenSize();
  }

  POINT_RADIUS : number  = 5;
  numEval : number = 100;

  drawStatus = [
    {name: 'showPoints', value : true},
    {name: 'showPoligonals', value : true},
    {name: 'showCurves', value : true},
  ];

  curves : Point[][] = [[]];

  @ViewChild('canvas', {static: true}) myCanvas!: ElementRef;

  canvas : any ;
  ctx! : CanvasRenderingContext2D ;

  updateEvaluations(val : string): void{
    this.numEval = Number(val);
    console.log(this.numEval);
    this.reDrawCurves();
  }
  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  onChange(id : number, event : any){
    if (this.drawStatus[id].value === true) {
      this.drawStatus[id].value = false;
    }
    else{
      this.drawStatus[id].value = true;
    }
    console.log(this.drawStatus[id].name, this.drawStatus[id].value)
    this.reDrawCurves();
  }

  // ----------------------------- ALGORITHM -----------------------------

  interpolation(A : Point, B : Point, t : number):Point{
    let newPoint : Point = {
      x : A.x * (1-t) + B.x * t,
      y : A.y * (1-t) + B.y * t
    }
    return newPoint
  }

  deCasteljau(points : Point[], t : number):Point{
    let degree : number = points.length - 1
    if (degree == 1){
      return this.interpolation(points[0], points[1], t)
    }
    else{
      let pointsAux : Point[] = [];
      for (let i = 0; i < degree; i++){
          pointsAux.push(this.interpolation(points[i], points[i+1], t));
      }
      return this.deCasteljau(pointsAux, t);
    }
  }

  // --------------------------- DRAWING-------------------------------------
  drawPoint(point : Point) : void {
    console.log("drawPoint")
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.POINT_RADIUS, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawLine(A : Point, B : Point) : void {
    console.log("drawLine")
    this.ctx.beginPath();
    this.ctx.lineTo(A.x, A.y);
    this.ctx.lineTo(B.x, B.y);
    this.ctx.strokeStyle = "12px"
    this.ctx.stroke();
  }

  drawControlPoligon(points : Point[] ) : void {
    console.log("drawControlPoligon")
    for (let i = 0; i < points.length - 1; i++){
      this.drawLine(points[i], points[i+1]);
  }
  }

  drawCurve(points : Point[]) : void {
    console.log("drawCurve")
     if(points.length > 2){
        var curvasBezier = [];
        curvasBezier.push(points[0]);
        for (let i = 1; i <= this.numEval-2; i++){
            curvasBezier.push(this.deCasteljau(points, i/(this.numEval - 1)));
        }
        curvasBezier.push(points[points.length-1]);
        this.drawControlPoligon(curvasBezier);
    }
  }

  reDrawCurves() : void {
    console.log("reDrawCurves")
    console.log(this.curves)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.drawStatus[0].value){
        for (let i = 0; i < this.curves.length; i++){
            for (let j = 0; j < this.curves[i].length; j++){
              this.ctx.strokeStyle = "black";
              this.drawPoint(this.curves[i][j]);

            }
        }
    }
    if (this.drawStatus[1].value){
        for (let i = 0; i < this.curves.length; i++){
            this.ctx.strokeStyle = "black";
            this.drawControlPoligon(this.curves[i]);
        }
    }
    if (this.drawStatus[2].value && this.numEval > 1){
        for (let i = 0; i < this.curves.length; i++){

            this.ctx.strokeStyle = "black";
            this.drawCurve(this.curves[i]);
        }
    }
  }

  // ------------------------- EVENT LISTENERS --------------------------------
  mouseClick(event: { offsetX: any; offsetY: any; }){
      console.log('clicou')
      let A : Point = {x : event.offsetX, y : event.offsetY};
      this.curves[0].push(A);
      this.reDrawCurves();
      //this.drawPoint(A);
  }
}
