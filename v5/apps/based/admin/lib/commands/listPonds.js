import HotPondsWebSocketClient from '../../../pond/client.js';

export default async function listPonds() {
    console.log('listPonds called');
    let client =  new HotPondsWebSocketClient({ bp: this.bp });

    let listPondsResponse = await client.apiRequest('', 'GET');

    // iterate through results and populate the #admin-list-ponds-table tbody
    let tbody = document.querySelector('#admin-list-ponds-table tbody');
    tbody.innerHTML = ''; // clear existing rows
    listPondsResponse.forEach(pond => {
        let tr = document.createElement('tr');
        let tdId = document.createElement('td');
        tdId.textContent = pond.pond_id;
        tr.appendChild(tdId);

        let tdConnections = document.createElement('td');
        tdConnections.textContent = pond.connection_count;
        tr.appendChild(tdConnections);

        let tdCreatedAt = document.createElement('td');
        let createdDate = new Date(pond.created_at);
        tdCreatedAt.textContent = createdDate.toLocaleString();
        tr.appendChild(tdCreatedAt);

        let tdLastActive = document.createElement('td');
        let lastActiveDate = new Date(pond.last_active);
        tdLastActive.textContent = lastActiveDate.toLocaleString();
        tr.appendChild(tdLastActive);

        let tdAction = document.createElement('td');
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'btn btn-danger btn-sm';
        deleteButton.onclick = async () => {
            if (confirm(`Are you sure you want to delete pond ${pond.pond_id}?`)) {
                try {
                    let deleteResponse = await client.apiRequest(`/pond/remove`, 'POST', { pond_id: pond.pond_id });
                    console.log('deleteResponse:', deleteResponse);
                    // remove the row from the table
                    tr.remove();
                } catch (error) {
                    console.error('Error deleting pond:', error);
                    alert('Error deleting pond. See console for details.');
                }
            }
        };
        tdAction.appendChild(deleteButton);
        tr.appendChild(tdAction);

        tbody.appendChild(tr);
    });
    console.log('listPondsResponse:', listPondsResponse);
}