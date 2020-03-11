# dhis2-gee-app

DHIS2 webapp that extracts values from Google Earth Engine for a given subset of DHIS2 OUs, a certain period and datasets/variables mapping and injects them into DHIS2.

## Setup

```
$ yarn install
```

## Development

Start development server:

```
$ PORT=8082 REACT_APP_DHIS2_BASE_URL="https://play.dhis2.org/dev" yarn start
```

Linting:

```
$ yarn lint
```

## Tests

Run unit tests:

```
$ yarn test
```

Run integration tests locally:

```
$ export CYPRESS_DHIS2_AUTH='admin:district'
$ export CYPRESS_EXTERNAL_API="http://localhost:8080"
$ export CYPRESS_ROOT_URL=http://localhost:8081

# non-interactive
$ yarn cy:e2e:run

# interactive UI
$ yarn cy:e2e:open
```

For this to work in Travis CI, you will have to create an environment variable CYPRESS_DHIS2_AUTH (Settings -> Environment Variables) with the password used in your testing DHIS2 instance.

Travis project: https://travis-ci.org/EyeSeeTea/dhis2-gee-app/builds

Cypress Dashboard: https://dashboard.cypress.io/projects/49be3z

## Build app ZIP

```
$ yarn build-webapp
```

## Some development tips

### Structure

-   `i18n/`: Contains literal translations (gettext format)
-   `public/`: Main app folder with a `index.html`, exposes the APP, contains the feedback-tool
-   `src/pages`: Main React components.
-   `src/components`: Reusable React components.
-   `src/models`: Models that hold all the logic of the app (pages/components only should contain view logic).
-   `src/types`: `.d.ts` file definitions for modules without Typescript definitions.
-   `src/utils`: Misc utilities.
-   `src/locales`: Auto-generated, don't change nor add to version control.
-   `cypress/integration/`: Contains the integration Cypress tests.

### i18n

```
$ yarn update-po
# ... add/edit translations in i18n/*.po files ...
$ yarn localize
```

### App context

File `src/contexts/app-context.ts` holds some general App context so typical infrastructure objects (`api`, `d2`, `currentUser`...) are readily available. Add your own objects if necessary.

```
import { useAppContext } from "./path/to/contexts/app-context";

const SomeComponent: React.FunctionComponent = () => {
    const { d2, api, currentUser } = useAppContext();
    ...
}
```
