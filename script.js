$(document).ready(function() {
    // URL to your CSV file
    var csvUrl = 'test.csv';
    
    var filterCount = 1;
  
    function initializeDataTable(data) {
      var headers = data[0];
      headers.forEach(function(header) {
        $('#table-head').append('<th>' + header + '</th>');
      });
  
      for (var i = 1; i < data.length; i++) {
        var row = '<tr>';
        for (var j = 0; j < data[i].length; j++) {
          row += '<td>' + data[i][j] + '</td>';
        }
        row += '</tr>';
        $('#table-body').append(row);
      }
  
      var table = new DataTable('#example', {
        "pagingType": "simple_numbers",
        "dom": '<"top"f>rt<"bottom"ip><"clear">',
        "language": {
          "search": "Filter records:"
        }
      });
      initializeSelect2();
  
      //  filtering function
      $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        var isValid = true;
        $('.filter-line').each(function() {
          var metric = $(this).find('.metric-filter').val();
          var comparison = $(this).find('.comparison-filter').val();
          var value = $(this).find('.value-filter').val();
          var unit = $(this).find('.unit-filter').val();
          var columnValue = parseFloat(data[headers.indexOf(metric)]); // Adjust based on your columns
  
          if (metric !== "" && comparison !== "" && value !== "" && unit !== "") {
            var comparisonValue = parseFloat(value) * (unit === 'million' ? 1000000 : 100000);
            
            switch (comparison) {
              case 'eq':
                if (columnValue !== comparisonValue) isValid = false;
                break;
              case 'lt':
                if (columnValue >= comparisonValue) isValid = false;
                break;
              case 'gt':
                if (columnValue <= comparisonValue) isValid = false;
                break;
              case 'lte':
                if (columnValue > comparisonValue) isValid = false;
                break;
              case 'gte':
                if (columnValue < comparisonValue) isValid = false;
                break;
            }
          }
        });
        return isValid;
      });
  
      // Event listener for filters
      $('#filter-section').on('change', '.metric-filter, .comparison-filter, .value-filter, .unit-filter', function() {
        table.draw();
      });
    }
  
    // Function to initialize Select2 on new filter lines
    function initializeSelect2() {
      $('.metric-filter').select2({
        placeholder: "Select Metric",
        allowClear: true
      });
      $('.comparison-filter').select2({
        placeholder: "Select Comparison",
        allowClear: true
      });
      $('.unit-filter').select2({
        placeholder: "Select Unit",
        allowClear: true
      });
    }
  
    // Event listener to add new filter line
    $('#add-filter-btn').on('click', function() {
      var newFilterLine = `
        <div class="row mb-3 filter-line">
          <div class="col">
            <label for="filter-metric-${filterCount}" class="form-label">Metric</label>
            <select id="filter-metric-${filterCount}" class="form-select metric-filter" style="width: 100%;">
              <option value="">select metric</option>
              <option value="revenue">revenue</option>
              <option value="fcf">fcf</option>
              <option value="capex">capex</option>
              <option value="gp">gp</option>
            </select>
          </div>
          <div class="col">
            <label for="filter-comparison-${filterCount}" class="form-label">Comparison</label>
            <select id="filter-comparison-${filterCount}" class="form-select comparison-filter" style="width: 100%;">
              <option value="">select comparison</option>
              <option value="eq">equal to</option>
              <option value="lt">less than</option>
              <option value="gt">greater than</option>
              <option value="lte">less than or equal</option>
              <option value="gte">greater than or equal</option>
            </select>
          </div>
          <div class="col">
            <label for="filter-value-${filterCount}" class="form-label">Value</label>
            <input id="filter-value-${filterCount}" type="number" class="form-control value-filter" placeholder="Enter value">
          </div>
          <div class="col">
            <label for="filter-unit-${filterCount}" class="form-label">Unit</label>
            <select id="filter-unit-${filterCount}" class="form-select unit-filter" style="width: 100%;">
              <option value="">select unit</option>
              <option value="million">million</option>
              <option value="lakhs">lakhs</option>
            </select>
          </div>
          <div class="col-auto align-self-end">
            <button class="btn btn-danger remove-filter-btn">Remove</button>
          </div>
        </div>
      `;
      $('#filter-section').append(newFilterLine);
      initializeSelect2();
      filterCount++;
    });
  
    // Event listener to remove filter line
    $('#filter-section').on('click', '.remove-filter-btn', function() {
      $(this).closest('.filter-line').remove();
      // Trigger table redraw to apply updated filters
      $('#example').DataTable().draw();
    });
  
    // Fetch and parse the CSV file
    Papa.parse(csvUrl, {
      download: true,
      complete: function(results) {
        initializeDataTable(results.data);
      }
    });
  });
  