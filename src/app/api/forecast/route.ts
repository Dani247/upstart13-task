import { NextRequest, NextResponse } from 'next/server';

export interface IForecast {
    number: number;
    name: string;
    startTime: string;
    endTime: string;
    isDaytime: boolean;
    temperature: number;
    temperatureUnit: string;
    temperatureTrend: string;
    probabilityOfPrecipitation: {
        unitCode: string;
        value: number;
    };
    windSpeed: string;
    windDirection: string;
    icon: string;
    shortForecast: string;
    detailedForecast: string;
}

export type IGroupedForecast = { [key: string]: Array<IForecast> }

const getCoordinates = async (address: string): Promise<{ lat: number, lng: number }> => {
    const url = new URL(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress`);
    url.searchParams.set('address', address)
    url.searchParams.set('benchmark', '4')
    url.searchParams.set('format', 'json')
    const res = await fetch(url)
    const data = await res.json();

    if (!data?.result?.addressMatches[0]) {
        throw new Error("Could not get coordinates")
    }

    return {
        lat: data?.result?.addressMatches[0].coordinates.y,
        lng: data?.result?.addressMatches[0].coordinates.x
    }
}

const getForecastUrl = async ({ lat, lng }: { lat: number, lng: number }) => {
    const url = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`;
    const res = await fetch(url);
    const pointData = await res.json();
    console.log("point data")
    console.log(pointData)
    if (!pointData.properties?.forecast) {
        throw new Error("No forecast URL found in weather point data")
    }
    return pointData.properties.forecast;
}

const sortByDate = (forecasts: Array<IForecast>) => {
    return forecasts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

const getForecastFromUrl = async (url: string): Promise<Array<IForecast>> => {
    const res = await fetch(url);
    const forecastData = await res.json();
    if (!forecastData?.properties?.periods?.length) {
        throw new Error("Could not find forecast data")
    }

    return forecastData?.properties?.periods;
}

const groupByDay = (forecasts: Array<IForecast>): IGroupedForecast => {
    const grouped: IGroupedForecast = {};

    forecasts.forEach(forecast => {
        const date = new Date(forecast.startTime);
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

        if (!grouped[dayKey]) {
            grouped[dayKey] = [];
        }

        grouped[dayKey].push(forecast);
    });

    return grouped;
}

export async function POST(request: NextRequest) {
    try {
        const { address } = await request.json()

        if (!address) {
            throw new Error("No address provided")
        }

        const { lat, lng } = await getCoordinates(address);
        const forecastUrl = await getForecastUrl({ lat, lng });
        const forecasts = await getForecastFromUrl(forecastUrl);
        const sorted = sortByDate(forecasts)
        const grouped = groupByDay(sorted);

        return NextResponse.json(grouped)
    } catch (error) {
        console.log("error", error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
} 