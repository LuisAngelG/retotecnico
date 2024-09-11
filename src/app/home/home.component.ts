import { Component, OnInit } from '@angular/core';
import { CountryService } from '../services/country.service';
import { PixabayService } from '../services/pixabay.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  showFilter: boolean = false;
  selectedSubdivision: string | null = null;
  selectedContinent: string | null = null;
  selectedCountry: any = null;

  countries: any[] = [];
  continents: any[] = [];
  filteredCountries: any[] = [];
  images: { [key: string]: string } = {};
  flags: { [key: string]: string } = {};
  continentImages: { [key: string]: string } = {};

  searchTerm: string = '';

  constructor(
    private countryService: CountryService,
    private pixabayService: PixabayService
  ) {}

  ngOnInit(): void {
    this.loadCountries();
    this.loadContinents();
  }

  loadCountries(): void {
    this.countryService.getCountries().subscribe(
      ({ data }: any) => {
        this.countries = data.countries;
        this.filteredCountries = this.countries;
        this.loadCountryImages();
      },
      error => {
        console.error('Error loading countries', error);
      }
    );
  }

  loadContinents(): void {
    this.countryService.getContinents().subscribe(
      ({ data }: any) => {
        this.continents = data.continents;
        this.continents.forEach(continent => {
          this.getImageForContinent(continent.name);
        });
      },
      error => {
        console.error('Error loading continents', error);
      }
    );
  }

  loadCountryImages(): void {
    this.filteredCountries.forEach(country => {
      this.flags[country.name] = `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`;

      if (country.capital) {
        const query = `${country.capital} city`;
        this.getImageForCountry(query, country.name)
          .then(success => {
            if (!success) {
              this.getImageForCountry(country.name, country.name);
            }
          });
      } else {
        this.getImageForCountry(country.name, country.name);
      }
    });
  }

  getImageForCountry(query: string, countryName: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.pixabayService.getImages(query).subscribe(
        (data: any) => {
          if (parseInt(data.totalHits) > 0) {
            const validImage = data.hits.find((hit: any) => {
              const tags = hit.tags.toLowerCase();
              return tags.includes('city') || tags.includes('landscape') || tags.includes('view') || tags.includes('building');
            });

            if (validImage) {
              this.images[countryName] = validImage.webformatURL;
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        },
        error => {
          console.error('Error fetching country image', error);
          resolve(false);
        }
      );
    });
  }

  getImageForContinent(continentName: string): void {
    const query = `${continentName} continent`;
    this.pixabayService.getImages(query).subscribe(
      (data: any) => {
        console.log(data);
        if (data.hits && data.hits.length > 0) {
          const validImage = data.hits[0].webformatURL;
          this.continentImages[continentName] = validImage;
        } else {
          console.log('No se encontraron imágenes para el continente:', continentName);
        }
      },
      error => {
        console.error('Error fetching continent image from Pixabay', error);
      }
    );
  }
    

  filterCountries() {
    this.filteredCountries = this.countries.filter((country) => {
      const matchesContinent = this.selectedContinent
        ? country.continent.name === this.selectedContinent
        : true;
      const matchesSearchTerm = this.searchTerm
        ? country.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchesContinent && matchesSearchTerm;
    });
  }

  selectContinent(continent: string) {
    this.selectedContinent = continent;
    this.filterCountries();
  }

  clearFilter() {
    this.selectedContinent = null;
    this.searchTerm = '';
    this.filterCountries();
  }

  hideFilter() {
    setTimeout(() => { 
      this.showFilter = false;
    }, 200);
  }

  showCountryDetails(country: any) {
    this.selectedCountry = { 
      ...country, 
      image: this.images[country.name] || '' 
    };
    this.selectedSubdivision = null;
  }

  closeModal() {
    this.selectedCountry = null;
    this.selectedSubdivision = null;
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
}
