export default function HowItWorks() {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 p-8">
          <h1 className="text-4xl font-bold">¿Cómo funciona?</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Resumen general del funcionamiento de la plataforma HydrIA.
          </p>
        </section>
  
        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">1. Captación</h2>
            <p className="mt-3 text-slate-300">
              Las estaciones recogen datos del entorno, como nivel de agua,
              lluvia y estado del sistema.
            </p>
          </div>
  
          <div className="rounded-3xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">2. Envío</h2>
            <p className="mt-3 text-slate-300">
              Los datos se envían al backend para su almacenamiento y tratamiento.
            </p>
          </div>
  
          <div className="rounded-3xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">3. Procesado</h2>
            <p className="mt-3 text-slate-300">
              La plataforma analiza la información recibida y determina el estado
              de cada estación.
            </p>
          </div>
  
          <div className="rounded-3xl bg-white/5 p-5">
            <h2 className="text-xl font-semibold">4. Consulta</h2>
            <p className="mt-3 text-slate-300">
              La web muestra el mapa, las estaciones y las alertas para consulta
              pública.
            </p>
          </div>
        </section>
  
        <section className="rounded-3xl bg-white/5 p-6">
          <h2 className="text-2xl font-semibold">Arquitectura general</h2>
          <p className="mt-4 text-slate-300">
            El sistema sigue una estructura sencilla: sensores y estaciones de
            medida, envío de datos, backend, base de datos y visualización final
            en la web.
          </p>
        </section>
      </div>
    );
  }