import { Injectable } from '@angular/core';
import { Point } from '../models/point'

@Injectable({
  providedIn: 'root'
})
export class CurvesService {

  constructor() { }

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

  drawPoint(point : Point) : void {

  }

  drawLine(A : Point, B : Point) : void {

  }

  drawControlPoligon() : void {

  }

  drawCurve() : void {

  }
}
