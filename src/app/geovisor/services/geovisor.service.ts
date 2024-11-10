import {ElementRef, Injectable} from '@angular/core';
import {LayerConfig} from '../interfaces/layerConfig';

//*Libreria de ArcGIS 4.30
import * as projection from '@arcgis/core/geometry/projection';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery.js';
import CoordinateConversion from '@arcgis/core/widgets/CoordinateConversion.js';
import Expand from '@arcgis/core/widgets/Expand.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Home from '@arcgis/core/widgets/Home.js';
import Legend from '@arcgis/core/widgets/Legend.js';
import Locate from "@arcgis/core/widgets/Locate.js";
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import Point from '@arcgis/core/geometry/Point';
import Search from "@arcgis/core/widgets/Search.js";
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Zoom from '@arcgis/core/widgets/Zoom.js';

//* Popup y Clusters

@Injectable({
	providedIn: 'root',
})
export class GeovisorSharedService {
	public mapa = new Map({basemap: 'topo'});
	public view!: MapView;

	public layerUrls = {
		baseService: 'https://www.idep.gob.pe/geoportal/rest/services',
		limits: {
			departamentos: 'DATOS_GEOESPACIALES/LÍMITES/FeatureServer/3',
			provincias: 'DATOS_GEOESPACIALES/LÍMITES/FeatureServer/4',
			distritos: 'DATOS_GEOESPACIALES/LÍMITES/FeatureServer/5',
		}
	}
	//*Servicio de delitos fuente INEI
	public layerUrlsmtc = {
		baseServicio: 'https://services8.arcgis.com/tPY1NaqA2ETpJ86A/arcgis/rest/services/INTERFERENCIAS_PMD/FeatureServer',
		interferencias: {
			pmd_limAmpliado: '3',
			pmd_actual: '1',
			pmd_amppliaciones: '2',
			pmd_interferencias: '0'

		}
	};
	public layers: LayerConfig[] = [
	//*Servicios de capas base
		//*Capas de Limites Politicos
		{
			title: 'DISTRITOS',
			url: `${this.layerUrls.baseService}/${this.layerUrls.limits.distritos}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: false,
			group: 'LIMITES POLITICOS',
		},
		{
			title: 'PROVINCIAS',
			url: `${this.layerUrls.baseService}/${this.layerUrls.limits.provincias}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: false,
			labelsVisible: false,
			group: 'LIMITES POLITICOS',
		},
		{
			title: 'DEPARTAMENTOS',
			url: `${this.layerUrls.baseService}/${this.layerUrls.limits.departamentos}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: true,
			labelsVisible: false,
			group: 'LIMITES POLITICOS',
		},
		{
			title: 'PDMs ACTUAL',
			url: `${this.layerUrlsmtc.baseServicio}/${this.layerUrlsmtc.interferencias.pmd_actual}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: true,
			labelsVisible: false,
			group: 'INTERFERENCIAS',
		},
		{
			title: 'PDMs AMPLIACIONES',
			url: `${this.layerUrlsmtc.baseServicio}/${this.layerUrlsmtc.interferencias.pmd_amppliaciones}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: true,
			labelsVisible: false,
			group: 'INTERFERENCIAS',
		},
		{
			title: 'PDMs LIMITE AMPLIADO',
			url: `${this.layerUrlsmtc.baseServicio}/${this.layerUrlsmtc.interferencias.pmd_limAmpliado}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: true,
			labelsVisible: false,
			group: 'INTERFERENCIAS',
		},
		{
			title: 'PDMs INTERFERENCIAS',
			url: `${this.layerUrlsmtc.baseServicio}/${this.layerUrlsmtc.interferencias.pmd_interferencias}`,
			labelingInfo: undefined,
			popupTemplate: undefined,
			renderer: undefined,
			visible: true,
			labelsVisible: false,
			group: 'INTERFERENCIAS',
		},
	];

	public lis: [] = [];
	public searchTerm = '';
	public filteredArray: [] = [];
	//* Footer coordenadas
	public gcsLongitude = '--';
	public gcsLatitude = '--';
	public utmZone = '--';
	public utmEast = '--';
	public utmNorth = '--';
	public scale = '--';
	public legend!: Legend;

	constructor() {}

	initializeMap(mapViewEl: ElementRef): Promise<void> {
		const container = mapViewEl.nativeElement;
		this.layers.forEach((layerConfig) => {
			let featureLayer;
			if (layerConfig.popupTemplate == undefined) {
				featureLayer = new FeatureLayer({
					url: layerConfig.url,
					title: layerConfig.title,
					visible: layerConfig.visible,
					outFields: layerConfig.outFields,
					featureReduction:layerConfig.featureReduction


				});
			}
			else if (layerConfig.popupTemplate && layerConfig.renderer == undefined) {
				featureLayer = new FeatureLayer({
					url: layerConfig.url,
					title: layerConfig.title,
					popupTemplate: layerConfig.popupTemplate,
					labelsVisible: layerConfig.labelsVisible,
					visible: layerConfig.visible,
					featureReduction:layerConfig.featureReduction
				});
			}
			else if (layerConfig.popupTemplate && layerConfig.renderer && layerConfig.labelingInfo == undefined) {
				featureLayer = new FeatureLayer({
					url: layerConfig.url,
					title: layerConfig.title,
					popupTemplate: layerConfig.popupTemplate,
					renderer: layerConfig.renderer,
					visible: layerConfig.visible,
					labelsVisible: layerConfig.labelsVisible,
					featureReduction:layerConfig.featureReduction
				});
			}
			else {
				featureLayer = new FeatureLayer({
					url: layerConfig.url,
					title: layerConfig.title,
					popupTemplate: layerConfig.popupTemplate,
					labelingInfo: layerConfig.labelingInfo,
					outFields: layerConfig.outFields,
					visible: layerConfig.visible,
					renderer: layerConfig.renderer,
					maxScale: layerConfig.maxScale,
					minScale: layerConfig.minScale,
					labelsVisible: layerConfig.labelsVisible,
					featureReduction:layerConfig.featureReduction
				});
			}
			this.mapa.add(featureLayer);
		});
		//*Creacion de la Vista del Mapa
		const view = new MapView({
			container: container,
			map: this.mapa,
			center: [-73.00000, -10.00000],
			zoom: 6,
			rotation: 0,
			constraints: {
				maxZoom: 25,
				minZoom: 1,
				snapToZoom: false,
			},
			padding: {top: 0},
			ui: {
				components: [],
			},
		});
		//*Escala del Mapa
		view.watch('scale', (scale) => {
			this.scale = this.formatScale(scale);
		});

		//CONTROLES DE FUNCION DEL MAPA (LADO DERECHO)
		view.ui.add(new Search({
			view,
			allPlaceholder:'Buscar direccion',
			label:'Buscar',
			locationEnabled:true,
			maxResults:5,

		}),
			{position:'top-right', index:0})
		view.ui.add(new Zoom({view}),{position:'top-right',index:1});
		view.ui.add(new Home({view }), {position:'top-right',index:2});
		view.ui.add(new Locate({view, icon:'gps-on-f'}),{position:'top-right', index:3});
		view.ui.add(new Expand({view, expandTooltip:'Galeria de Mapas Base', content: new BasemapGallery({view, icon:'move-to-basemap'})}), {position:'top-right', index:4});

		this.legend = new Legend({view, container: document.createElement('div')});
		new CoordinateConversion({view });
		view.on('pointer-move', (event: {x: number; y: number}) => {
			const point = this.view.toMap({x: event.x, y: event.y});
			this.updateCoordinates(point.latitude, point.longitude);
		}); this.view = view;
		 return this.view.when();
	} //*Fin <initializeMap>
	//*Inicio del Toogle
	toggleLayerVisibility(layerTitle: string, visibility: boolean): void {
		const layer = this.mapa.layers.find((layer) => layer.title === layerTitle);
		if (layer) {
			layer.visible = visibility;
		}
	} //*Fin de toggleLayerVisibility

	//*Inicio carga de capa
	getLayerVisibility(layerTitle: string): boolean {
		const layer = this.mapa.layers.find((layer) => layer.title === layerTitle);
		return layer ? layer.visible : false;
	}

	private capas: Record<string, FeatureLayer> = {};
	getActiveLayers(): FeatureLayer[] {
		return Object.values(this.capas).filter((layer) => layer.visible);
	}

	updateCoordinates(lat: number, lon: number): void {
		this.gcsLongitude = lon.toFixed(5);
		this.gcsLatitude = lat.toFixed(5);
		// Calculate UTM Zone
		const zoneNumber = Math.floor((lon + 180) / 6) + 1;
		const utmBand = this.getUtmBand(lat);
		this.utmZone = `${zoneNumber} ${utmBand}`;

		// Convert to UTM
		const pointUTM = new Point({
			latitude: lat,
			longitude: lon,
			spatialReference: SpatialReference.WGS84,
		});
		const utmWkid = lat >= 0 ? 32600 + zoneNumber : 32700 + zoneNumber; // WKID for UTM zone
		const projected = projection.project(pointUTM, new SpatialReference({wkid: utmWkid})) as Point;

		const utmPoint = projected as Point;
		this.utmEast = `${utmPoint.x.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})} m`;
		this.utmNorth = `${utmPoint.y.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})} m`;
	}

	getUtmBand(latitude: number): string {
		const bands = 'CDEFGHJKLMNPQRSTUVWX'; // Bands from 80S to 84N
		const index = Math.floor((latitude + 80) / 8);
		return bands.charAt(index);
	}

	formatScale(scale: number): string {
		return scale.toLocaleString('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
	}


}
