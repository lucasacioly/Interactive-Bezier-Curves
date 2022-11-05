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
  control:boolean = false;
  @HostListener('window:resize', ['$event'])
  getScreenSize(_event?: undefined) {
        this.scrHeight = window.innerHeight - 1;
        this.scrWidth = window.innerWidth - 281;
        if (this.control){
          console.log('ok')
          this.reDrawCurves();
        }
        this.control = true;
        console.log(this.scrHeight, this.scrWidth);
  }

  // Constructor
  constructor() {
      this.getScreenSize();
  }

  POINT_RADIUS:number =10;
  numEval : number = 100;

  drawStatus = [
    {name: 'showPoints', value : true},
    {name: 'showPoligonals', value : true},
    {name: 'showCurves', value : true},
  ];

  newCurve : boolean = false;
  selectCurve : boolean = false;
  addPoint : boolean = false;
  movePoint : boolean = false;

  curves : Point[][] = [];
  curent_curve_idx : number = -1;
  current_point_idx = {curve : -1, point :-1};

  @ViewChild('canvas', {static: true}) myCanvas!: ElementRef;
  canvas : any ;
  ctx! : CanvasRenderingContext2D ;
  CLICK : boolean = false;

  ngOnInit(): void {
    this.canvas = this.myCanvas.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  /*
  onResizeWin() : void{
    this.canvas.nativeElement.height = this.scrHeight;
    this.canvas.nativeElement.width = this.scrWidth;
    this.ctx = this.canvas.nativeElement.getContext("2d");
    this.reDrawCurves
  }*/

  updateEvaluations(val : string): void{
    let v = Number(val);
    if (v > 500){
      this.numEval = 500;
    }
    else{
      this.numEval = Number(val);
    }
    console.log(this.numEval);
    this.reDrawCurves();
  }

  onChange(id : number){
    if (this.drawStatus[id].value === true) {
      this.drawStatus[id].value = false;
    }
    else{
      this.drawStatus[id].value = true;
    }
    console.log(this.drawStatus[id].name, this.drawStatus[id].value)
    this.reDrawCurves();
  }

  updateTools(id : string): void{
    this.newCurve = false;
    this.selectCurve = false;
    this.addPoint = false;
    this.movePoint = false;
    this.reset_sel_point();

    switch (id) {
      case 'newCurve':
        this.newCurve = true;
        break;

      case 'selectCurve':
        this.selectCurve = true;
        break;

      case 'addPoint':
        this.addPoint = true;
        break;

      case 'movePoint':
        this.movePoint = true;
        break;
    }

    this.reDrawCurves();
    console.log(this.newCurve, this.selectCurve, this.addPoint, this.movePoint)
  }

  delPoint(){
    if (this.movePoint === true && this.current_point_idx.curve != -1){
      this.curves[this.current_point_idx.curve].splice(this.current_point_idx.point, 1);
      this.reDrawCurves();
      this.current_point_idx = {curve : -1, point : -1};
    }
  }

  delCurve(){
    if (this.selectCurve === true && this.current_point_idx.curve != -1){
      this.curves.splice(this.current_point_idx.curve, 1);
      this.reDrawCurves();
      this.current_point_idx = {curve : -1, point : -1};
      this.curent_curve_idx = -1;
    }
  }

  selCurve() {
    if (this.movePoint === true && this.current_point_idx.curve != -1){
      this.curves.splice(this.current_point_idx.curve, 1);
      this.reDrawCurves();
    }
  }

  reset_sel_point(){
    if (this.current_point_idx.point != -1){

      this.curves[this.current_point_idx.curve][this.current_point_idx.point].color = 'black'
      this.current_point_idx = {curve : -1, point : -1};
    }
  }

  // ----------------------------- ALGORITHM -----------------------------

  interpolation(A : Point, B : Point, t : number):Point{
    let newPoint : Point = {
      x : A.x * (1-t) + B.x * t,
      y : A.y * (1-t) + B.y * t,
      radius : this.POINT_RADIUS,
      color : 'black'
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

  // --------------------------- DRAWING -------------------------------------
  drawPoint(point : Point) : void {
    console.log("drawPoint")
    this.ctx.beginPath();
    this.ctx.arc(point.x, point.y, this.POINT_RADIUS, 0, 2 * Math.PI);
    this.ctx.fillStyle = point.color;
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawLine(A : Point, B : Point) : void {
    console.log("drawLine")
    this.ctx.beginPath();
    this.ctx.lineTo(A.x, A.y);
    this.ctx.lineTo(B.x, B.y);
    this.ctx.strokeStyle = "12px"
    this.ctx.stroke();
    this.ctx.closePath();
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

            this.ctx.strokeStyle = "blue";
            this.drawCurve(this.curves[i]);
        }
    }
    console.log(this.curves)
  }

  // ------------------------- EVENT LISTENERS --------------------------------
  mouseClick(event: { offsetX: any; offsetY: any; }){

      if (this.movePoint){
        let x_click= event.offsetX
        let y_click = event.offsetY
        let sel_point : Point = this.curves[this.current_point_idx.curve][this.current_point_idx.point]
        let A : Point = {x : x_click, y : y_click, radius : this.POINT_RADIUS, color : sel_point.color};
        this.curves[this.current_point_idx.curve]?.splice(this.current_point_idx.point, 1, A)
        this.reDrawCurves();
      }
  }

  mouseDown(event : MouseEvent){
      this.CLICK = true;
      let x_click= event.offsetX
      let y_click = event.offsetY
      let A : Point = {x : x_click, y : y_click, radius : this.POINT_RADIUS, color : 'black'};

      console.log(event)
      if (this.addPoint){
        this.curves[this.curent_curve_idx].push(A);
        this.reDrawCurves();
      }
      else if (this.newCurve){
        let newIdx = this.curves.length
        let newCurve: Point[] = []
        this.curves.push(newCurve)
        this.curves[newIdx].push(A)
        this.curent_curve_idx = newIdx;
        this.updateTools('addPoint')
        this.reDrawCurves();
      }
      else if (this.movePoint){
        for (let curve = 0; curve < this.curves.length; curve++){
          for (let point = 0; point < this.curves[curve].length; point++){
            let distance = Math.sqrt((x_click - this.curves[curve][point].x)**2 + (y_click - this.curves[curve][point].y)**2)
            if (distance < this.POINT_RADIUS) {
              if (this.current_point_idx.point != -1){
                this.curves[this.current_point_idx.curve][this.current_point_idx.point].color = 'black'
              }
              this.curves[curve][point].color = 'red'
              this.current_point_idx = {curve : curve, point : point}
              console.log('foi')
            }
          }
        }
        this.reDrawCurves();
      }
      else if (this.selectCurve){
        for (let curve = 0; curve < this.curves.length; curve++){
          for (let point = 0; point < this.curves[curve].length; point++){
            let distance = Math.sqrt((x_click - this.curves[curve][point].x)**2 + (y_click - this.curves[curve][point].y)**2)
            if (distance < this.POINT_RADIUS) {
              if (this.current_point_idx.point != -1){
                for (let point1 = 0; point1 < this.curves[this.current_point_idx.curve].length; point1++) {
                  this.curves[this.current_point_idx.curve][point1].color = 'black'
                }
              }
              for (let point = 0; point < this.curves[curve].length; point++){
                  this.curves[curve][point].color = 'yellow'
              }
              this.current_point_idx = {curve : curve, point : point}
              console.log('foi')
            }
          }
        }
        this.reDrawCurves();
      }
    
  }

  mouseMove(event : MouseEvent){
    if (this.CLICK && this.movePoint){
      let x_click= event.offsetX
      let y_click = event.offsetY
      let sel_point : Point = this.curves[this.current_point_idx.curve][this.current_point_idx.point]
      let A : Point = {x : x_click, y : y_click, radius : this.POINT_RADIUS, color : sel_point.color};
      this.curves[this.current_point_idx.curve]?.splice(this.current_point_idx.point, 1, A)
      this.reDrawCurves();
    }
  }

  mouseUp(event: MouseEvent){
    this.CLICK = false;
  }

}



