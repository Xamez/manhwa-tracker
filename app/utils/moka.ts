declare global {
  interface Window {
    invoke: (address: string, payload: any) => Promise<any>;
  }
}

export const invoke = async <T = any>(address: string, payload: any = {}): Promise<T> => {
  if (import.meta.server) {
    console.warn(`[Moka] Appel ignoré côté serveur (SSR) pour : ${address}`);
    return Promise.reject('Invoke est client-side only');
  }

  // A. MODE NATIF (Priorité absolue)
  if (typeof window.invoke !== 'undefined') {
    return window.invoke(address, payload);
  }

  // B. MODE NAVIGATEUR (Développement)
  console.groupCollapsed(`[Moka Dev] Appel vers '${address}'`);

  // 1. Pont HTTP vers Quarkus (localhost:8080)
  try {
    // On utilise $fetch de Nuxt, mais fetch natif marche aussi très bien
    const response = await fetch('http://localhost:8080/_moka/bridge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, payload }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse Backend (HTTP) :', data);
      console.groupEnd();
      return data as T;
    }
  } catch (e) {
    console.debug('⚠️ Backend Java injoignable. Passage aux Mocks.');
  }

  console.error(`❌ Échec de l'appel vers '${address}': Backend injoignable.`);
  console.groupEnd();
  return Promise.reject(`Backend injoignable pour l'adresse '${address}'`);
};
