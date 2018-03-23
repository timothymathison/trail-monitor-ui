# Trail Monitor Web Portal

---

This project implements a data visualization web portal application with ReactJS.
The project is part of the Polaris 2018 Senior Design project and pulls data from the [Trail Monitor Cloud](https://github.com/timothymathison/TrailMonitor-AWS-Lambda) AWS Service.
Trail conditions are visualized as a dynamically drawn and colored feature layer on top of Mapbox geographic maps. 

## Running and Deploying

Install dependencies: `npm install`

Run in development mode: `npm start`

---

Build project for production: `npm run build`  (production code will be in the build folder)

OR deploy/upload to S3: `npm run deploy` (NOT yet implimented)

## Dependencies
- React: v16.2.0
- mapbox-gl: v0.44.1
- react-mapbox-gl: v3.8.0
- react-select: v1.2.1
- react-spinners: v0.2.6
- react-toggle-button: v2.2.0

## References

- [React](https://reactjs.org/)
- [React Readme](./REACT_README.md)
- [React Component Lifecycle](http://busypeoples.github.io/post/react-component-lifecycle/)
- [ReactMapboxGL](https://github.com/alex3165/react-mapbox-gl/blob/HEAD/docs/API.md)
- [MapboxGL](https://www.mapbox.com/mapbox-gl-js/api/)
- [MapboxGL Styles](https://www.mapbox.com/mapbox-gl-js/style-spec/)
- [Heatmap Example](https://www.mapbox.com/mapbox-gl-js/example/heatmap-layer/)
- [React Spinners](http://reactscript.com/loading-spinner-kit-react/)
- [React Toggle Button](https://gdowens.github.io/react-toggle-button/)
- [React Select](https://github.com/JedWatson/react-select)
