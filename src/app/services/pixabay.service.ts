import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PixabayService {
  private apiKey = '45915609-ebaf8f814e21cdff35ce2ec29';
  private apiUrl = 'https://pixabay.com/api/';

  constructor(private http: HttpClient) {}

  getImages(query: string): Observable<any> {
    const url = `${this.apiUrl}?key=${this.apiKey}&q=${encodeURIComponent(query)}&image_type=photo`;
    return this.http.get<any>(url);
  }
}
