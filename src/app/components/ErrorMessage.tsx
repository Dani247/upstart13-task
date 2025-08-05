interface IProps {
    error: string
}

function ErrorMessage({ error }: IProps) {
    return <div className="alert alert-error mb-6">
        <span>{error}</span>
    </div>
}

export default ErrorMessage;