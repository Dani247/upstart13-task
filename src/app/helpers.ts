export const getWeatherEmoji = (forecast: string) => {
    const lower = forecast.toLowerCase()
    if (lower.includes("sunny") || lower.includes("clear")) return "☀️"
    if (lower.includes("cloud")) return "☁️"
    if (lower.includes("rain")) return "🌧️"
    if (lower.includes("storm")) return "⛈️"
    if (lower.includes("snow")) return "❄️"
    if (lower.includes("fog")) return "🌫️"
    return "🌤️"
}

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return "Tomorrow";
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}