import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

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

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    console.log(this.name.value);
    this.loadContent();
    this.ngOnChanges()
  }

  loadContent() {
    this.http.get('assets/movies2020.json').subscribe((data: any) => {
      this.movies = data;
    });
  }

  getDetails() {
    this.searchResults = this.name.value ? this.movies.filter(x => x.title.includes(this.name.value)) : [];
              console.log(this.movies)
    console.log(this.searchResults);
  }

  ngOnChanges(){
    this.name.valueChanges.subscribe((x: string) => {
      console.log(x);
    })
  }
}
