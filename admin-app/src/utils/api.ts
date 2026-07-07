export function getApiBaseUrl(): string {
  // Try custom environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // If running inside browser on Vercel production domain
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app')) {
      // Dynamic fallback to the customer storefront Vercel API production domain
      return 'https://sss-baby-skin-care.vercel.app';
    }
  }
  
  // Default fallback for local environment
  return 'http://localhost:3000';
}
