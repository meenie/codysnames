# CODYSNAMES
It's like Codenames, but it's Codysnames.

## Tools used
1. [Create React App](https://github.com/facebook/create-react-app)
1. [Firebase](https://firebase.google.com)
1. [Material UI](https://material-ui.com)

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

It will also start a Firebase dev server on http://localhost:4000 which will serve up the [dynamic reserved URLs](https://firebase.google.com/docs/web/setup#from-hosting-urls) to auto initialize the app locally and in production.

### `yarn deploy`

Runs the `firebase deploy --only hosting` command which has a pre-deploy hook that runs `yarn build` and pushes those files up to Firebase.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
