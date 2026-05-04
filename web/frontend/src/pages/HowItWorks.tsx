export default function HowItWorks() {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-white via-cyan-50 to-blue-100 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 text-slate-900 dark:text-white p-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">¿Cómo funciona?</h1>
          <p className="mt-3 max-w-3xl text-slate-800 dark:text-slate-300">
            Resumen general del funcionamiento de la plataforma Hyd<span className="text-indigo-600 dark:text-fuchsia-400 font-bold">RIA</span>.
          </p>
        </section>
  
        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. Captación</h2>
            <p className="mt-3 text-slate-800 dark:text-slate-300">
              Las estaciones recogen datos del entorno, como nivel de agua,
              lluvia y estado del sistema.
            </p>
          </div>
  
          <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. Envío</h2>
            <p className="mt-3 text-slate-800 dark:text-slate-300">
              Los datos se envían al backend para su almacenamiento y tratamiento.
            </p>
          </div>
  
          <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Procesado</h2>
            <p className="mt-3 text-slate-800 dark:text-slate-300">
              La plataforma analiza la información recibida y determina el estado
              de cada estación.
            </p>
          </div>
  
          <div className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-sm border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Consulta</h2>
            <p className="mt-3 text-slate-800 dark:text-slate-300">
              La web muestra el mapa, las estaciones y las alertas para consulta
              pública.
            </p>
          </div>
        </section>
  
        <section className="rounded-3xl bg-gradient-to-br from-white to-cyan-50 shadow-md border border-slate-100 dark:border-none dark:bg-gradient-to-br dark:from-indigo-900/50 dark:to-fuchsia-900/20 p-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Arquitectura general</h2>
          <p className="mt-4 text-slate-800 dark:text-slate-300">
            El sistema sigue una estructura sencilla: sensores y estaciones de
            medida, envío de datos, backend, base de datos y visualización final
            en la web.
          </p>
        </section>
      </div>
    );
  }