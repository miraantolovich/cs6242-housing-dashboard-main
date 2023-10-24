async function getPrediction(city, state) {
    const response = await fetch(`http://localhost:5000/predict?city=${city}&state=${state}`);
    const data = await response.json();
    console.log(data)
    return data;
}


var cities = [
    { city: 'Atlanta', state: 'GA'},
    { city: 'Boston', state: 'MA' },
    { city: 'Los Angeles', state: 'CA'},
    { city: 'Miami', state: 'FL'},
    { city: 'New York', state: 'NY' },
    { city: 'San Francisco', state: 'CA' }
  ];

var citySelect = d3.select('body')
  .append('select')
  .attr('id', 'city-select');

var cityOptions = citySelect.selectAll('option')
  .data(cities)
  .enter()
  .append('option')
  .text(function(d) { return d.city + ', ' + d.state; })
  .attr('value', function(d) { return d.city + ',' + d.state; });

function getData() {
    var cityState = citySelect.property('value').split(',');
    var city = cityState[0];
    var state = cityState[1];
    console.log(city,',',state)

    getPrediction(city, state).then(data => {
        console.log(data);
    });
}

citySelect.on('change', getData);