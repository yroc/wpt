// META: global=window,worker
// META: script=/resources/WebIDLParser.js
// META: script=/resources/idlharness.js
// META: script=cache-storage/resources/test-helpers.js
// META: script=service-worker/resources/test-helpers.sub.js
// META: timeout=long

idl_test(
  ['service-workers'],
  ['dom', 'html'],
  async (idl_array, t) => {
    self.cacheInstance = await create_temporary_cache(t);

    idl_array.add_objects({
      CacheStorage: ['caches'],
      Cache: ['self.cacheInstance'],
      ServiceWorkerContainer: ['navigator.serviceWorker']
    });

    if (self.GLOBAL.isWindow()) {
      idl_array.add_objects({
        ServiceWorkerRegistration: ['window.registrationInstance'],
        ServiceWorker: ['window.registrationInstance.installing']
      });

      const scope = 'resources/scope/idlharness';
      const registration = await service_worker_unregister_and_register(
          t, 'resources/empty-worker.js', scope);
      t.add_cleanup(() => registration.unregister());

      window.registrationInstance = registration;
      idl_array.add_objects({
        ServiceWorkerRegistration: ['window.registrationInstance'],
        ServiceWorker: ['window.registrationInstance.installing']
      });
    } else if (self.ServiceWorkerGlobalScope) {
      idl_array.add_objects({
        Clients: ['clients'],
        ExtendableEvent: ['new ExtendableEvent("type")'],
        // TODO: FetchEvent
        ServiceWorkerGlobalScope: ['self'],
        ServiceWorkerRegistration: ['registration'],
        ServiceWorker: ['serviceWorker'],
        // TODO: Test instances of Client and WindowClient, e.g.
        // Client: ['self.clientInstance'],
        // WindowClient: ['self.windowClientInstance']
      });
    }
  }
);
