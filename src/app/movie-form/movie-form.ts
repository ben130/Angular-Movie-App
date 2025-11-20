import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, map, Observable, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';
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
  
  // Filter and sort options
  selectedGenre: string = '';
  selectedDecade: string = '';
  sortBy: string = 'title';
  allGenres: string[] = [];
  filteredResults: any[] = [];

  constructor(private http: HttpClient) {
    
  }

  ngOnInit(){
    this.loadContent();
    this.ngOnChanges()
  }

  ngOnChanges(){
    // Auto-search as user types (with debounce)
    this.name.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((value: string) => {
      if (value && value.length > 0) {
        this.search();
      } else {
        this.searchResults = [];
        this.filteredResults = [];
      }
    });
  }

  loadContent() {
    this.getMovies();
    this.getTopRated();
  }

  getMovies() {     
    this.getAllMovies().subscribe(data => {
      this.movies = data;
      // Extract all unique genres
      const genreSet = new Set<string>();
      data.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
          item.genres.forEach(genre => genreSet.add(genre));
        }
      });
      this.allGenres = Array.from(genreSet).sort();
    });
  }

  getAllMovies(): Observable<IMovie[]> {
    // Load the manifest to get the list of movie and TV show files, then load all files
    return this.http.get<{movieFiles: string[], tvShowFiles: string[]}>('assets/movies-manifest.json').pipe(
      switchMap(manifest => {
        // Combine both movie and TV show files into a single array
        const allFiles = [...manifest.movieFiles, ...manifest.tvShowFiles];
        // Create HTTP requests for all files listed in the manifest
        const requests: Observable<IMovie[]>[] = allFiles.map(name =>
          this.http.get<IMovie[]>(`assets/${name}`)
        );
        // Load all files in parallel and flatten the results
        return forkJoin(requests).pipe(
          map(results => results.flat())
        );
      })
    );
  }

  getTopRated(){
    this.http.get('assets/top-rated.json').subscribe((data: any) => {
      this.topRated = data;
    });
  }

  search() {
    if (!this.name.value || this.name.value.trim().length === 0) {
      this.searchResults = [];
      this.filteredResults = [];
      return;
    }
    
    const searchTerm = this.name.value.toLowerCase().trim();
    this.searchResults = this.movies.filter(x => 
      x.title.toLowerCase().includes(searchTerm)
    );
    this.applyFilters();
  }

  clearSearch() {
    this.name.setValue('');
    this.searchResults = [];
    this.filteredResults = [];
    this.selectedGenre = '';
    this.selectedDecade = '';
    this.sortBy = 'title';
  }

  applyFilters() {
    // Only apply filters if we have search results
    if (this.searchResults.length === 0) {
      this.filteredResults = [];
      return;
    }
    
    let results = [...this.searchResults];
    
    // Filter by genre
    if (this.selectedGenre) {
      results = results.filter(item => 
        item.genres && Array.isArray(item.genres) && item.genres.includes(this.selectedGenre)
      );
    }
    
    // Filter by decade
    if (this.selectedDecade) {
      const decadeStart = parseInt(this.selectedDecade);
      const decadeEnd = decadeStart + 9;
      results = results.filter(item => 
        item.year >= decadeStart && item.year <= decadeEnd
      );
    }
    
    // Sort results
    results.sort((a, b) => {
      if (this.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (this.sortBy === 'year') {
        return b.year - a.year; // Newest first
      }
      return 0;
    });
    
    this.filteredResults = results;
  }

  onGenreChange() {
    this.applyFilters();
  }

  onDecadeChange() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  getRandomMovie() {
    const index = Math.floor(Math.random() * this.movies.length);
    this.randomMovie = this.movies[index];
  }

  getDecades(): number[] {
    const decades = new Set<number>();
    this.movies.forEach(item => {
      const decade = Math.floor(item.year / 10) * 10;
      decades.add(decade);
    });
    return Array.from(decades).sort((a, b) => b - a); // Newest first
  }
}

