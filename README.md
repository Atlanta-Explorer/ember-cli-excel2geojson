# ember-cli-excel2geojson

Ember addon for converting Excel spreadsheets to GeoJSON for use in the ATLMaps platform.

## Installation in ATLMaps
### From GitHub
In your `package.json` add:
```
"ember-cli-excel2geojson": "git://github.com/jayvarner/ember-cli-excel2geojson.git#develop"
```
Replace `develop` with which ever branch you want to use.

Run:
```
yarn installation
ember g excel2geojson
```

## Development

### Clone this repo and install dependencies
~~~bash
git clone https://github.com/Atlanta-Explorer/ember-cli-excel2geojson.git
cd ember-cli-excel2geojson
yarn install # or npm install
bower install # this may not be needed
~~~

### Run the dummy app
~~~bash
ember s
~~~

See the dummy app at [http://localhost:4200](http://localhost:4200)


### Usage
When used as a block, a simple file input filed will be rendered. After an excel file is uploaded, it will appear in an [ember-light-table](http://offirgolan.github.io/ember-light-table/). Below the table will be a list of select fields for the control attributes.

| Field       | Type               | Note                                                                                         |
|-------------|--------------------|----------------------------------------------------------------------------------------------|
| Title       | String             |                                                                                              |
| Lat         | Float              |                                                                                              |
| Lng         | Float              |                                                                                              |
| Description | Long text (string) |                                                                                              |
| Images      | Array              | Currently only handles a comma separated + space list of image links that start with `http`. |
| Video       | String             | Currently only handles links to YouTube.                                                     |
| Audio       | String             | Not actually implemented.                                                                    |
| Filter      | String             | A key to use for filtering. Sorry, this is a complicated work in progress.                   |

```
{{#parse-spreadsheet}}
{{!-- Stuff you want to do --}}
{{/parse-spreadsheet}}
```

## Development
### Installation

* `git clone <repository-url>` this repository
* `cd ember-cli-excel2geojson`
* `npm install`

### Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

### Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
