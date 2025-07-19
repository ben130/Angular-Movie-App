import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, map, Observable } from 'rxjs';

@Component({
  selector: 'app-movie-form',
  standalone: false,
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.css'
})
export class MovieForm {
  name: FormControl = new FormControl("");
  searchResults: any[] = [];
  movies: any[] = [];
  topRated: any[] = [];
  randomMovie: any = {};
  movies2020: any[] = [];
  movies2010: any[] = [];
  movies2000: any[] = [];

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    console.log(this.name.value);
    this.loadContent();
    this.ngOnChanges()
  }

  loadContent() {
    this.getMovies();
    this.getTopRated();
  }

  getMovies() {
    // this.http.get('assets/movies2020.json').subscribe((data: any) => {
    //   this.movies2020 = data;
    // });
    // this.http.get('assets/movies-2010s.json').subscribe((data: any) => {
    //   this.movies2010 = data;
    //   console.log(this.movies2010)
    // });            
    this.getAllMovies().subscribe(data => {
      this.movies = data;
      console.log(this.movies)
      console.log(this.movies.filter(x => x.Title == "Cars 2"))
    });
  }

getAllMovies(): Observable<any[]> {
  const files = ['movies2020.json', 'movies-2010s.json', 'movies-2000s.json'];
  const requests: Observable<any[]>[] = files.map(name =>
    this.http.get<any[]>(`assets/${name}`)
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

  getDetails() {
    this.searchResults = this.name.value ? this.movies.filter(x => x.title.toString().includes(this.name.value)) : [];
    console.log(this.movies.filter(x => x.title.includes(this.name.value)))
  }

  getRandomMovie() {
    const index = Math.floor(Math.random() * this.movies.length);
    this.randomMovie = this.movies[index];
  }

  ngOnChanges(){
    this.name.valueChanges.subscribe((x: string) => {
      console.log(x);
    })
  }
}
