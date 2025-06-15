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

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    console.log(this.name.value)

    this.ngOnChanges()
  }

  getDetails() {
    const apiurl = "https://www.omdbapi.com/?apikey=dfe6d885";
    console.log(apiurl + "&s=" + this.name.value)
    this.http.get<any>(apiurl + "&s=" + this.name.value).subscribe((x: any) => {
      console.log(x)
      console.log(x.Search)
      if (x.Response.toLowerCase() == "true") {
        this.searchResults = x.Search
        console.log(this.searchResults)
      }

    })
  }

  ngOnChanges(){
    this.name.valueChanges.subscribe((x: string) => {
      console.log(x);
    })
  }
}
