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

OR build and deploy/upload to S3: `npm run deploy` __Note: First set up CLI command line tool__

Set Up CLI:

- Install: `pip install awscli --upgrade --user`
- Generate Access Key under "Deployment" user in IAM console
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
- [Deploying React App to Amazon S3](https://medium.com/@omgwtfmarc/deploying-create-react-app-to-s3-or-cloudfront-48dae4ce0af)
- [Installing AWS CLI Command Line Tool](https://docs.aws.amazon.com/cli/latest/userguide/installing.html)
- [CLI Documentation](https://aws.amazon.com/cli/)
