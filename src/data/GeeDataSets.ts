export const geeDataSets: { [name: string]: any } = {
    chirpsDaily: {
        displayName: "CHIRPS - DAILY",
        description: "Climate Hazards Group InfraRed Precipitation with Station Data",
        pointer: "UCSB-CHG/CHIRPS/DAILY",
        bands: [{ name: "precipitation", units: "mm/day", description: "Precipitation" }],
        doc: "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
    },
    era5Daily: {
        displayName: "ERA5 - DAILY",
        description:
            "Latest climate reanalysis produced by ECMWF / Copernicus Climate Change Service",
        pointer: "ECMWF/ERA5/DAILY",
        bands: [
            {
                name: "mean_2m_air_temperature",
                units: "K",
                description: "Average air temperature at 2m height (daily average)",
            },
            {
                name: "minimum_2m_air_temperature",
                units: "K",
                description: "Minimum air temperature at 2m height (daily minimum)",
            },
            {
                name: "maximum_2m_air_temperature",
                units: "K",
                description: "Maximum air temperature at 2m height (daily maximum)",
            },
            {
                name: "dewpoint_2m_temperature",
                units: "K",
                description: "Dewpoint temperature at 2m height (daily average)",
            },
            {
                name: "total_precipitation",
                units: "m",
                description: "Total precipitation (daily sums)",
            },
            {
                name: "surface_pressure",
                units: "Pa",
                description: "Surface pressure (daily average)",
            },
            {
                name: "mean_sea_level_pressure",
                units: "Pa",
                description: "Mean sea level pressure (daily average)",
            },
            {
                name: "u_component_of_wind_10m",
                units: "m s-1",
                description: "10m u-component of wind (daily average)",
            },
            {
                name: "v_component_of_wind_10m",
                units: "m s-1",
                description: "10m v-component of wind (daily average)",
            },
        ],
        doc: "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
    },
    era5Montly: {
        displayName: "ERA5 - Montly",
        description:
            "Latest climate reanalysis produced by ECMWF / Copernicus Climate Change Service",
        pointer: "ECMWF/ERA5/MONTHLY",
        bands: [
            {
                name: "mean_2m_air_temperature",
                units: "K",
                description: "Average air temperature at 2m height (daily average)",
            },
            {
                name: "minimum_2m_air_temperature",
                units: "K",
                description: "Minimum air temperature at 2m height (daily minimum)",
            },
            {
                name: "maximum_2m_air_temperature",
                units: "K",
                description: "Maximum air temperature at 2m height (daily maximum)",
            },
            {
                name: "dewpoint_2m_temperature",
                units: "K",
                description: "Dewpoint temperature at 2m height (daily average)",
            },
            {
                name: "total_precipitation",
                units: "m",
                description: "Total precipitation (daily sums)",
            },
            {
                name: "surface_pressure",
                units: "Pa",
                description: "Surface pressure (daily average)",
            },
            {
                name: "mean_sea_level_pressure",
                units: "Pa",
                description: "Mean sea level pressure (daily average)",
            },
            {
                name: "u_component_of_wind_10m",
                units: "m s-1",
                description: "10m u-component of wind (daily average)",
            },
            {
                name: "v_component_of_wind_10m",
                units: "m s-1",
                description: "10m v-component of wind (daily average)",
            },
        ],
        doc: "https://developers.google.com/earth-engine/datasets/catalog/UCSB-CHG_CHIRPS_DAILY",
    },
    daymetV3: {
        displayName: "DAYMET V3",
        description: "Daily Surface Weather and Climatological Summaries",
        pointer: "NASA/ORNL/DAYMET_V3",
        bands: [
            {
                name: "dayl",
                units: "seconds",
                description:
                    "Duration of the daylight period. Based on the period of the day during which the sun is above a hypothetical flat horizon.",
            },
            {
                name: "prcp",
                units: "mm",
                description:
                    "Daily total precipitation, sum of all forms converted to water-equivalent.",
            },
            {
                name: "srad",
                units: "W/m^2",
                description:
                    "Incident shortwave radiation flux density, taken as an average over the daylight period of the day.",
            },
            {
                name: "swe",
                units: "kg/m^2",
                description:
                    "Incident shortwave radiation flux density, taken as an average over the daylight period of the day.",
            },
            { name: "tmax", units: "°C", description: "Daily maximum 2-meter air temperature." },
            { name: "tmin", units: "°C", description: "Daily minimum 2-meter air temperature." },
            {
                name: "vp",
                units: "Pa",
                description: "Daily average partial pressure of water vapor.",
            },
        ],
        doc: "https://developers.google.com/earth-engine/datasets/catalog/NASA_ORNL_DAYMET_V3",
    },
    waterClassYearly: {
        displayName: "Yearly Water Classification History",
        description: "JRC Yearly Water Classification History, v1.1",
        pointer: "JRC/GSW1_1/YearlyHistory",
        bands: [
            {
                name: "waterClass",
                units: "",
                description: "Classification of the seasonality of water throughout the year.",
            },
        ],
        doc: "https://developers.google.com/earth-engine/datasets/catalog/JRC_GSW1_1_YearlyHistory",
    },
};
