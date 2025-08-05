import { NextRequest, NextResponse } from 'next/server';

class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}

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
    try {
        const url = new URL(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress`);
        url.searchParams.set('address', address)
        url.searchParams.set('benchmark', '4')
        url.searchParams.set('format', 'json')
        const res = await fetch(url)

        if (!res.ok) {
            throw new ApiError("Geocoding service is currently unavailable", 503);
        }

        const data = await res.json();

        if (!data?.result?.addressMatches?.length) {
            throw new ApiError("Address not found. Please check the spelling and try again.", 404);
        }

        return {
            lat: data.result.addressMatches[0].coordinates.y,
            lng: data.result.addressMatches[0].coordinates.x
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Failed to geocode address", 500);
    }
}

const getForecastUrl = async ({ lat, lng }: { lat: number, lng: number }): Promise<string> => {
    try {
        const url = `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new ApiError("Weather service is currently unavailable", 503);
        }

        const pointData = await res.json();

        if (!pointData.properties?.forecast) {
            throw new ApiError("No forecast data available for this location", 404);
        }

        return pointData.properties.forecast;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Failed to get forecast URL", 500);
    }
}

const sortByDate = (forecasts: Array<IForecast>) => {
    return forecasts.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

const getForecastFromUrl = async (url: string): Promise<Array<IForecast>> => {
    try {
        const res = await fetch(url);

        if (!res.ok) {
            throw new ApiError("Weather forecast service is currently unavailable", 503);
        }

        const forecastData = await res.json();

        if (!forecastData?.properties?.periods?.length) {
            throw new ApiError("No forecast periods available", 404);
        }

        return forecastData.properties.periods;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Failed to fetch forecast data", 500);
    }
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

        if (!address || typeof address !== 'string' || address.trim().length === 0) {
            throw new ApiError("Please provide a valid address", 400);
        }

        const trimmedAddress = address.trim();

        if (trimmedAddress.length < 3) {
            throw new ApiError("Address must be at least 3 characters long", 400);
        }

        const { lat, lng } = await getCoordinates(trimmedAddress);
        const forecastUrl = await getForecastUrl({ lat, lng });
        const forecasts = await getForecastFromUrl(forecastUrl);
        const sorted = sortByDate(forecasts)
        const grouped = groupByDay(sorted);

        return NextResponse.json(grouped)
    } catch (error) {
        console.error("Forecast API error:", error);

        if (error instanceof ApiError) {
            return NextResponse.json({
                error: error.message
            }, { status: error.status });
        }

        return NextResponse.json({
            error: "An unexpected error occurred. Please try again later.",
        }, { status: 500 });
    }
} 