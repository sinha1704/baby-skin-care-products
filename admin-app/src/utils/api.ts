export function getApiBaseUrl(): string {
  // If running inside browser
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Check if hosted on any Vercel domain (includes preview branch subdomains)
    if (host.includes('vercel.app')) {
      return 'https://sss-baby-skin-care.vercel.app';
    }
  }

  // Fallback environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Default fallback for local development
  return 'http://localhost:3000';
}
