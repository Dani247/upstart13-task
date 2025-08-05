'use client'
import Image from "next/image";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { IForecast, IGroupedForecast } from "./api/forecast/route";
import { formatDate, getWeatherEmoji } from "./helpers";



export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecasts, setForecasts] = useState<IGroupedForecast>({});
  const signal = useRef<AbortController>(null)
  signal.current = new AbortController()

  const getForecastData = async (a: string) => {
    const body = JSON.stringify({ address: a })
    const res = await fetch('/api/forecast', { method: "POST", body, signal: signal?.current?.signal });
    const foreCastData = await res.json()
    console.log(foreCastData)
    return foreCastData;
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    // @ts-expect-error
    const address = e?.target['address']?.value?.trim()

    if (!address) return;

    setLoading(true);
    try {
      const data = await getForecastData(address)
      setForecasts(data);
    } catch (error) {
      console.error(error)
      setError("Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      signal?.current?.abort();
    }
  }, [])

  // Get the next 7 days of forecasts
  const next7Days = useMemo(() => {
    const sortedDates = Object.keys(forecasts).sort();
    return sortedDates.slice(0, 7);
  }, [forecasts])

  return (
    <div className="min-h-screen bg-gradient-to-brp-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-boldmb-2">Weather Forecast</h1>
        </div>


        <form onSubmit={onSubmit} className="flex justify-center p-10">
          <label className="input w-100">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </g>
            </svg>
            <input defaultValue={'1600 Pennsylvania Avenue NW, Washington, DC 20500'} name="address" type="search" className="grow" placeholder="1600 Pennsylvania Avenue NW, Washington, DC 20500" />
            <kbd className="kbd kbd-sm">Enter</kbd>
          </label>

          <button type="submit" className="btn btn-soft">Search</button>
        </form>

        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center mb-6">
          {loading && <span className="loading loading-ring loading-lg"></span>}
        </div>

        {Object.keys(forecasts).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {next7Days.map((date) => {
              const dayForecasts = forecasts[date];
              const dayForecast = dayForecasts.find(f => f.isDaytime) || dayForecasts[0];
              const nightForecast = dayForecasts.find(f => !f.isDaytime) || dayForecasts[dayForecasts.length - 1];

              return (
                <div key={date} className="card shadow-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg font-semibold  mb-2">
                      {formatDate(date)}
                    </h3>

                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {getWeatherEmoji(dayForecast?.shortForecast || '')}
                      </div>
                      <p className="text-sm font-medium">
                        {dayForecast?.shortForecast || 'N/A'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">High</span>
                        <span className="font-semibold text-lg">
                          {dayForecast?.temperature || 'N/A'}°{dayForecast?.temperatureUnit || 'F'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Low</span>
                        <span className="font-semibold text-lg">
                          {nightForecast?.temperature || 'N/A'}°{nightForecast?.temperatureUnit || 'F'}
                        </span>
                      </div>

                      {dayForecast?.probabilityOfPrecipitation?.value > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Rain</span>
                          <span className="font-semibold text-blue-600">
                            {dayForecast.probabilityOfPrecipitation.value}%
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Wind</span>
                        <span className="font-semibold text-sm">
                          {dayForecast?.windSpeed || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="divider my-3"></div>

                    <div className="text-xs text-gray-500">
                      <p className="mb-1">
                        <span className="font-medium">Day:</span> {dayForecast?.detailedForecast?.split('.')[0] || 'N/A'}
                      </p>
                      {nightForecast && nightForecast !== dayForecast && (
                        <p>
                          <span className="font-medium">Night:</span> {nightForecast?.detailedForecast?.split('.')[0] || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
