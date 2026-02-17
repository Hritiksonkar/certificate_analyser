import ReactDOM from 'react-dom/client';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

// Internet Identity requires a valid hostname; modern browsers/validators often reject plain
// "localhost" origins. Use a dot-hostname in dev to avoid "Invalid hostname/origin" errors.
if (import.meta.env.DEV) {
    const { protocol, hostname, port, pathname, search, hash } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        const nextUrl = `${protocol}//app.localhost${port ? `:${port}` : ''}${pathname}${search}${hash}`;
        window.location.replace(nextUrl);
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>
            <App />
        </InternetIdentityProvider>
    </QueryClientProvider>
);
