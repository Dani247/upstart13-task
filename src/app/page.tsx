'use client'
import { FormEvent, useEffect, useRef, useState } from "react";
import { IGroupedForecast } from "./api/forecast/route";
import WeatherCard from "./components/WeatherCard";
import SearchForm from "./components/SearchForm";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecasts, setForecasts] = useState<IGroupedForecast>({});
  const signal = useRef<AbortController>(null)
  signal.current = new AbortController()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;
    // @ts-expect-error
    const address = e?.target['address']?.value?.trim()

    if (!address) return;

    setLoading(true);
    setError("")
    try {
      const body = JSON.stringify({ address })
      const res = await fetch('/api/forecast', { method: "POST", body, signal: signal?.current?.signal });
      const foreCastData = await res.json()
      if (!foreCastData) {
        setError("Could not find that address")
        return;
      }
      setForecasts(foreCastData);
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

  return (
    <div className="min-h-screen bg-gradient-to-brp-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-boldmb-2">Weather Forecast</h1>
        </div>

        <SearchForm onSubmit={onSubmit} />

        {error && <ErrorMessage error={error} />}

        {loading && <LoadingSpinner />}

        {Object.keys(forecasts).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(forecasts).map(([date, dayForecasts]) => {
              return <WeatherCard key={date} date={date} dayForecasts={dayForecasts} />
            })}
          </div>
        )}
      </div>
    </div>
  );
}
