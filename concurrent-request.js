async function makeConcurrentRequests() {
    const url = 'http://localhost:3000/api/auth/login';
    
    const request1 = {
      companyCode: 'DEFAULT',
      username: 'test',
      password: 'test'
    };
  
    const request2 = {
      companyCode: 'DEFAULT',
      username: 'test_2',
      password: 'test'
    };
  
    try {
      console.log('Iniciando peticiones concurrentes...');
      const startTime = Date.now();
  
      const [response1, response2] = await Promise.all([
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request1)
        }),
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request2)
        })
      ]);
  
      const data1 = await response1.json();
      const data2 = await response2.json();
  
      const endTime = Date.now();
  
      console.log('Tiempo total de ejecución:', endTime - startTime, 'ms');
      console.log('\nRespuesta 1:', {
        status: response1.status,
        data: data1
      });
      console.log('\nRespuesta 2:', {
        status: response2.status,
        data: data2
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Ejecutar las peticiones
  makeConcurrentRequests();