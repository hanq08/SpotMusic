import {Injectable} from '@angular/core'
import {Http, Headers, RequestOptions} from '@angular/http'
import 'rxjs/add/operator/map';

@Injectable()
export class SpotifyService{
    private searchUrl: string;
    private artistUrl: string;
    private albumsUrl: string;
    private albumUrl: string;
    private authUrl: string;
    private auth: string;
    private headers = new Headers({ 'Accept': 'application/json' });
    private options: RequestOptions;
    
    constructor(private _http:Http){
        this._http.get('/login');
        this.options = new RequestOptions({ headers: this.headers });
        this.headers.append('Authorization', `Bearer AQDf3WGmIybVZuWFQFNDGocZOuyITDHIWbCS5l6AWlUk8S-ZrmClBJK20R3Slx6jvbpMRWPvDCyYh0lI`);
    }

    searchMusic(str:string, type='artist'){
        this.searchUrl='/search?query=' + str;
        return this._http.get(this.searchUrl)
            .map((res, err) => res.json());
    }

    getArtist(id:string){
        this.artistUrl='/artist?query=' + id;
        return this._http.get(this.artistUrl, this.options)
            .map(res => res.json());
    }

    getAlbums(id:string){
        this.albumsUrl = '/albums?query=' + id;
        return this._http.get(this.albumsUrl, this.options)
            .map(res => res.json());
    }
    
    getAlbum(id:string){
        this.albumUrl = '/album?query=' + id;
        return this._http.get(this.albumUrl, this.options)
            .map(res => res.json());
    }
}