# Trail Monitor Web Portal/Application

---

This project implements a data visualization web portal application with ReactJS.
The project is part of the Polaris 2018 Senior Design project and pulls data from the [Trail Monitor Cloud](https://github.com/timothymathison/TrailMonitor-AWS-Lambda) AWS Service.
Trail conditions are visualized as a dynamically drawn and colored feature layer on top of Mapbox geographic maps. 

## Running and Deploying

(Prerequisite: Install Node and NPM)

#### Install project dependencies: `npm install`

#### Run locally in development mode: `npm start`

---

#### Build project for production: `npm run build`
(production code will be in the build folder)

OR

#### Build for production and deploy/upload to AWS S3: `npm run deploy`
__Note:__ First set up CLI command line tool

##### Set Up CLI:

- Install: `pip install awscli --upgrade --user`
- Generate Access Key under "Deployment" user in AWS IAM console
- Configure credentials:
```
$ aws configure
AWS Access Key ID [None]: <access key from above>
AWS Secret Access Key [None]: <secret access key from above>
Default region name [None]: us-east-2
Default output format [None]: json
```
Note 1: Target S3 bucket to which to deploy, is specified in [package.json](./package.json)

Note 2: See references below for more information about Amazon S3

---

## Environment

Special resource identifiers and API keys are stored in `.env*` files.
These control what resources the application uses when in development or deployed in production.

Current environment variable definitions:
- `REACT_APP_MAPBOX_API_KEY=` key that gives application access to Mapbox data and resources
(__Note:__ currently connected to personal account belonging to Timothy Mathison; if Mapbox errors occur, try replacing with a new key)
- `REACT_APP_DATA_SERVICE=` name that informs the application what type of data service it is connected to
- `REACT_APP_AWS_API_URL=` url that the application uses to connect to the data service, from which to request data

__Note:__ when a constant value is used within the code which may change when the environment or build purpose changes,
it is best to define it with an environment variable.

To access an environment variable within React Javascript, access: `process.env.<variable-name>`

All environment variable names must begin with `REACT_APP_`

Current `.env*` files:
- `.env` (contains default environment variable definitions)
- `.env.production` (contains definitions which override the above defaults in a production build of the project)
- `.env.production.local` (this file is ignored by git, but can be used to override above definitions when deploying a production build from a specific machine)
- `.env.development.local` (same as above, but for development mode)

## Dependencies

- React: v16.2.0
- react-dom: v16.2.0
- env-cmd: v7.0.0
- mapbox-gl: v0.44.2
- react-mapbox-gl: v3.8.0
- react-spinners: v0.2.6
- react-toggle-button: v2.2.0

---

## Design - Algorithms and Logic

Much of the core logic within this applications focuses on handling and caching tile data.
It is important to note that the tiles referred to should not be confused with Mapbox vector tiles (used to render the map).

Each tile corresponds to a map square separated by integer longitude and latitude lines and a particular zoom range.
The Mapbox zoom values separating each zoom range are determined by the data service when it processes individual trail points into visualization data.
For a more detailed description of the format and information contained within the visualization data coming from the data service,
__see the README in the Trail Monitor Cloud repository__.

The core application logic determines whether to update the data on the map whenever the map viewing window changes or the user selects a different display option.
If an update is required, the application first checks the cache (when enabled) and, if possible, updates the trail data on the map.

When data tiles are required which the application does not posses, it requests data for the current viewing window, time span, and zoom,
after which it caches (when enabled) the tiles returned for the current time span and zoom range.
When the application wishes to show trail conditions to the user, it passes the correct tiles to the __MapDisplay__ Component,
which extracts the point and line data (in GeoJson Feature format) from each tile
and uses the contained information to render a visualization of the trail conditions.

---

## References

- [React](https://reactjs.org/)
- [Environment Command Tool](https://github.com/toddbluhm/env-cmd)
- [React Readme](./REACT_README.md)
- [React Component Lifecycle](http://busypeoples.github.io/post/react-component-lifecycle/)
- [React MapboxGL](https://github.com/alex3165/react-mapbox-gl/blob/HEAD/docs/API.md)
- [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api/)
- [Mapbox GL Styles](https://www.mapbox.com/mapbox-gl-js/style-spec/)
- [Mapbox Heatmap Example](https://www.mapbox.com/mapbox-gl-js/example/heatmap-layer/)
- [React Spinners](http://reactscript.com/loading-spinner-kit-react/)
- [React Toggle Button](https://gdowens.github.io/react-toggle-button/)
- [React Select](https://github.com/JedWatson/react-select)
- [Deploying React App to Amazon S3](https://medium.com/@omgwtfmarc/deploying-create-react-app-to-s3-or-cloudfront-48dae4ce0af)
- [Installing AWS CLI (Command Line Tool)](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- [CLI Documentation](https://aws.amazon.com/cli/)
- [Visualization Color Palettes and More](https://blog.graphiq.com/finding-the-right-color-palettes-for-data-visualizations-fcd4e707a283)
