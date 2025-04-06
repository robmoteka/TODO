import { ReportHandler } from 'web-vitals';

// Funkcja do raportowania metryk wydajności aplikacji
const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Cumulative Layout Shift - mierzy niestabilność wizualną
      getCLS(onPerfEntry);
      // First Input Delay - mierzy czas do pierwszej interakcji
      getFID(onPerfEntry);
      // First Contentful Paint - mierzy czas do pierwszego renderowania treści
      getFCP(onPerfEntry);
      // Largest Contentful Paint - mierzy czas ładowania największego elementu
      getLCP(onPerfEntry);
      // Time to First Byte - mierzy czas odpowiedzi serwera
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
