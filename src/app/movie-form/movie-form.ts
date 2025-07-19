import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, map, Observable } from 'rxjs';
import { IMovie } from '../models/IMovie';

@Component({
  selector: 'app-movie-form',
  standalone: false,
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.css'
})
export class MovieForm {
  name: FormControl = new FormControl("");
  searchResults: any[] = [];
  movies: IMovie[] = [];
  topRated: any[] = [];
  randomMovie: IMovie | undefined = undefined;

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    this.loadContent();
    this.ngOnChanges()
  }

  ngOnChanges(){
    this.name.valueChanges.subscribe((x: string) => {
      console.log(x);
    })
  }

  loadContent() {
    this.getMovies();
    this.getTopRated();
  }

  getMovies() {     
    this.getAllMovies().subscribe(data => {
      this.movies = data;
    });
  }

  getAllMovies(): Observable<IMovie[]> {
    const files = ['movies2020.json', 'movies-2010s.json', 'movies-2000s.json', 'movies-1990s.json', 'movies-1980s.json'];
    const requests: Observable<IMovie[]>[] = files.map(name =>
      this.http.get<IMovie[]>(`assets/${name}`)
    );
    return forkJoin(requests).pipe(
      map(results => results.flat())
    );
  }

  getTopRated(){
    this.http.get('assets/top-rated.json').subscribe((data: any) => {
      this.topRated = data;
    });
  }

  search() {
    this.searchResults = this.name.value ? this.movies.filter(x => x.title.toLowerCase().includes(this.name.value.toLowerCase())) : [];
  }

  getRandomMovie() {
    const index = Math.floor(Math.random() * this.movies.length);
    this.randomMovie = this.movies[index];
  }
}

