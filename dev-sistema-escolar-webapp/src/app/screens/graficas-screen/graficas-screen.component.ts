import { Component, OnInit } from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { AdministradoresService } from 'src/app/services/administradores.service';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {

  public total_user: any = {};
  public isDataLoaded: boolean = false; 

  // Configuración para ocultar etiquetas con valor 0
  public dataLabelConfig = {
    formatter: (value: any, ctx: any) => {
      if (value > 0) {
        return value;
      } else {
        return null;
      }
    },
    display: (ctx: any) => {
      return ctx.dataset.data[ctx.dataIndex] > 0;
    }
  };

  public commonOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: this.dataLabelConfig,
      legend: { position: 'top' },
      tooltip: {
        enabled: true, // Forzamos activado
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ${value} usuarios`;
          }
        }
      }
    }

  };

  // 1. Gráfica de Líneas
  lineChartData: ChartConfiguration['data'] = {
    labels: ["Admin", "Maestros", "Alumnos"],
    datasets: [{
        data:[0,0,0],
        label: 'Registro de materias',
        backgroundColor: '#F88406',
        borderColor: '#F88406', 
        tension: 0.3
    }]
  }
  lineChartOption: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      datalabels: { display: false },
      tooltip: { enabled: true }
    }
  }
  lineChartPlugins = [ ChartDataLabels ];

  // 2. Gráfica de Barras
  barChartData: ChartConfiguration['data'] = {
    labels: ["Admins", "Maestros", "Alumnos"],
    datasets: [{
        data:[0,0,0],
        label: 'Eventos Académicos',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB', '#FB82F5', '#2AD84A']
    }]
  }
  barChartOption: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      datalabels: { anchor: 'end', align: 'end' },
      tooltip: { enabled: true }
    }
  }
  barChartPlugins = [ ChartDataLabels ];

  // 3. Gráfica Circular (Pie)
  pieChartData: ChartConfiguration['data'] = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
        data: [0, 0, 0], // Inicializamos en 0 esperando al backend
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
    }]
  }
  pieChartOption: ChartConfiguration['options'] = this.commonOptions;
  pieChartPlugins = [ ChartDataLabels ];

  // 4. Gráfica Doughnut
  doughnutChartData: ChartConfiguration['data'] = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [{
        data: [0, 0, 0], // Inicializamos en 0
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
    }]
  }
  doughnutChartOption: ChartConfiguration['options'] = this.commonOptions;
  doughnutChartPlugins = [ ChartDataLabels ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    try{
      Chart.register(...registerables, ChartDataLabels);
    }catch(e){
      console.warn(e);
    }
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios recibidos:", this.total_user);
        
        const alumnosCount = this.total_user['alumnos'] || this.total_user.alumnos || 0;

        const datos = [
          this.total_user.admins || 0, 
          this.total_user.maestros || 0, 
          alumnosCount
        ];

        console.log("Datos a graficar:", datos);

        this.pieChartData = {
          ...this.pieChartData,
          datasets: [{
            ...this.pieChartData.datasets[0],
            data: datos
          }]
        };

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{
            ...this.doughnutChartData.datasets[0],
            data: datos
          }]
        };

        this.lineChartData = {
          ...this.lineChartData,
          datasets: [{
            ...this.lineChartData.datasets[0],
            data: datos
          }]
        };

        this.barChartData = {
          ...this.barChartData,
          datasets: [{
            ...this.barChartData.datasets[0],
            data: datos
          }]
        };

        this.isDataLoaded = true; 

      }, (error)=>{
        console.error("Error al obtener total de usuarios ", error);
      }
    );
  }
}