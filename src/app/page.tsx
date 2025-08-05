'use client'
import { FormEvent, useEffect, useRef, useState } from "react";
import { IGroupedForecast } from "./api/forecast/route";
import WeatherCard from "./components/WeatherCard";
import SearchForm from "./components/SearchForm";
import ErrorMessage from "./components/ErrorMessage";
import LoadingSpinner from "./components/LoadingSpinner";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forecasts, setForecasts] = useState<IGroupedForecast>({});
  const signal = useRef<AbortController>(null)
  signal.current = new AbortController()

  const fetchForecast = async (address: string) => {
    if (loading) return;

    setLoading(true);
    setError(null);
    setForecasts({});

    try {
      const body = JSON.stringify({ address });
      const res = await fetch('/api/forecast', {
        method: "POST",
        body,
        signal: signal?.current?.signal
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.error || "An error occurred";
        setError(errorMessage);
        return;
      }

      if (!data || Object.keys(data).length === 0) {
        setError("No forecast data available for this location");
        return;
      }

      setForecasts(data);
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const address = (e.target as HTMLFormElement).address?.value?.trim();

    if (!address) {
      setError("Please enter an address");
      return;
    }

    await fetchForecast(address);
  };

  useEffect(() => {
    return () => {
      signal?.current?.abort();
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-brp-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mt-8">
          <h1 className="text-4xl font-boldmb-2">Weather Forecast</h1>
          <p>Enter a U.S. address to get the weather forecast</p>
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
