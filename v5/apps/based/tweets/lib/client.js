const client = {};

// client.endpoint = buddypond.adminEndpoint;
client.endpoint = 'http://192.168.200.59:9020';

client.apiRequest = async (uri, method = 'GET', data = null) => {

    const options = {
        method: method
    };

    let headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        "X-Me": buddypond.me
      };
      if (buddypond.qtokenid) {
        headers["Authorization"] = `Bearer ${buddypond.qtokenid}`; // ✅ Use Authorization header
      }


    if (data) {
        options.body = JSON.stringify(data);
    }

    options.headers = headers;

    let url = `${client.endpoint}${uri}`;
    console.log('tweets client making api request', url, options);
 

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
          console.log('rrrr', response)
          // get text from response
          const errorText = await response.text();
          throw new Error(errorText || response.statusText || 'API request failed');
            //throw new Error(response.statusText || 'API request failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in API request:', error);
        throw error;
    }

};

export default client;