import { IForecast } from "../api/forecast/route";
import { formatDate, getWeatherEmoji } from "../helpers"

interface IProps {
    date: string,
    dayForecasts: Array<IForecast>
}

function WeatherCard({ date, dayForecasts }: IProps) {
    const dayForecast = dayForecasts.find(f => f.isDaytime) || dayForecasts[0];
    const nightForecast = dayForecasts.find(f => !f.isDaytime) || dayForecasts[dayForecasts.length - 1];

    return <div className="card shadow-2xl hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
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
}

export default WeatherCard