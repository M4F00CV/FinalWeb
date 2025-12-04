import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class eventosRegistroService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaEvento(){
    return {
      'titulo': '',
      'tipo_evento': '',
      'fecha_inicio': '',
      'fecha_fin': '',
      'lugar': '',
      'publico_objetivo': [],
      'programa_educativo': '',
      'descripcion': '', 
      'cupo_maximo': '', 
      'responsable': '',
    }
  }

  // Validación completa antes de enviar al backend
  public validarRegistro(data: any, editar: boolean){
    console.log("Validando evento... ", data);
    let error: any = [];

    if(!this.validatorService.required(data["titulo"])){
      error["titulo"] = this.errorService.required;
    } 

    if(!this.validatorService.required(data["tipo_evento"])){
      error["tipo_evento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["fecha_inicio"])){
      error["fecha_inicio"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["fecha_fin"])){
      error["fecha_fin"] = this.errorService.required;
    } else {
        // VALIDACIÓN DE FECHAS: Fin debe ser posterior a Inicio
        if(new Date(data["fecha_fin"]) <= new Date(data["fecha_inicio"])){
            error["fecha_fin"] = "La fecha de fin debe ser posterior a la de inicio";
            // Opcional: mostrar alert
            // alert("La fecha de finalización no puede ser antes o igual a la de inicio");
        }
    }

    if(!this.validatorService.required(data["lugar"])){
      error["lugar"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["programa_educativo"])){
      error["programa_educativo"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["descripcion"])){
      error["descripcion"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["cupo_maximo"])){
      error["cupo_maximo"] = this.errorService.required;
    } else if(!this.validatorService.numeric(data["cupo_maximo"])){
      error["cupo_maximo"] = "Solo se permiten números";
    }

    if(!this.validatorService.required(data["responsable"])){
      error["responsable"] = this.errorService.required;
    }
    
    if(data["publico_objetivo"].length == 0){
        error["publico_objetivo"] = "Selecciona al menos un público objetivo";
    }

    return error;
  }

  public registrarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  public actualizarEvento(data: any): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  public obtenerListaMaestrosAdmins(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/admins-maestros/`, { headers });
  }
  
  public obtenerListaEventos(): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.get<any>(`${environment.url_api}/eventos-all/`, { headers });
 }

 public eliminarEvento(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  public obtenerEventoPorId(idEvento: number): Observable<any>{
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

}