import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private countriesQuery = gql`
    query GetCountries {
      countries {
        code
        name
        capital
        currency
        languages{
          name
        }
        continent {
          name
        }
        subdivisions{
          name
        }
      }
    }
  `;
  private continentsQuery = gql`
    query GetContinents {
      continents {
        code
        name
      }
    }
  `;

  constructor(private apollo: Apollo) {}

  getCountries(): Observable<any> {
    return this.apollo.watchQuery({
      query: this.countriesQuery
    }).valueChanges;
  }

  getContinents(): Observable<any> {
    return this.apollo.watchQuery({
      query: this.continentsQuery
    }).valueChanges;
  }

  filterCountries(name: string, continent: string): Observable<any> {
    const filterQuery = gql`
      query FilterCountries($name: String!, $continent: String!) {
        countries(where: { name_contains: $name, continent: { name: $continent } }) {
          code
          name
          capital
          currency
          languages{
              name
          }
          continent {
            name
          }
          subdivisions{
            name
          }
        }
      }
    `;

    return this.apollo.watchQuery({
      query: filterQuery,
      variables: {
        name,
        continent
      }
    }).valueChanges;
  }
}
