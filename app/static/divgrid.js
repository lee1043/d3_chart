import { parcoordsColors } from "./parcoords_colors.js";
/**
 * @description Create an ordinal scale to map climate models to unique colors
 * @param model_names An array of model names from the dataset
 * @returns d3 Ordinal scale - An ordinal scale that will map to colors
 */
function createColorScale(model_names) {
  return d3
    .scaleOrdinal()
    .domain(model_names)
    .range(parcoordsColors);
}

d3.divgrid = function(config) {
  var columns = [];
  let active;

  function togglePathHighlight(d) {
    let path = d3.select("path." + d["model_name"]);
    if (path.classed("path_highlight")) {
      path.classed("path_highlight", false);
      path.classed("path_regular", true);
    } else {
      path.classed("path_highlight", true);
      path.classed("path_regular", false);
    }
  }

  function rowClicked(rowDomElement, d, rowColors) {
    togglePathHighlight(d);
    let clickedRow = d3.select(rowDomElement);
    let modelName = rowDomElement.dataset.model_name;
    clickedRow.classed("row_highlight", !clickedRow.classed("row_highlight"));
    if (clickedRow.classed("row_highlight")) {
      clickedRow.style("background-color", rowColors(modelName));
      clickedRow.style("color", "#deffffff");
    } else {
      clickedRow.style("background", "none").style("color", "#4a4a4a");
    }
  }

  function highlightAll(d, rowColors) {
    let rows = d3
      .selectAll(".row")
      .filter(function(d) {
        return !d3.select(this).classed("row_highlight");
      })
      .each(function(d) {
        rowClicked(this, d, rowColors);
      });
  }

  function deselectAll(d, rowColors) {
    let rows = d3
      .selectAll(".row")
      .filter(function(d) {
        return d3.select(this).classed("row_highlight");
      })
      .each(function(d) {
        rowClicked(this, d, rowColors);
      });

    let paths = d3.selectAll(".coordinate_path").filter(function() {
      return d3.select(this).classed("path_highlight");
    });
    if (!paths.empty()) {
      paths.each(function(d) {
        togglePathHighlight(d);
      });
    }
  }

  var dg = function(selection) {
    if (columns.length == 0) columns = d3.keys(selection.data()[0][0]);

    let modelNames = selection.data()[0].map(d => d["model_name"]);

    let rowColors = createColorScale(modelNames);

    let selectAllButton = d3.select("#select_all").on("click", function(d) {
      highlightAll(d, rowColors);
    });

    let deselectAllButton = d3.select("#deselect_all").on("click", function(d) {
      deselectAll(d, rowColors);
    });

    // header
    selection
      .selectAll(".header")
      .data([true])
      .enter()
      .append("div")
      .attr("class", "columns header");

    var header = selection
      .select(".header")
      .selectAll(".columns")
      .data(columns);

    header
      .enter()
      .append("div")
      .attr("class", function(d, i) {
        return "column is-size-7-desktop col-" + i;
      });
    // .classed("cell", true);

    selection.selectAll(".header .column").text(function(d) {
      if (d == "model_name") {
        return "name";
      }
      return d;
    });

    header.exit().remove();

    // rows
    var rows = selection.selectAll(".row").data(function(d) {
      return d;
    });

    rows
      .enter()
      .append("div")
      .attr("class", function(d) {
        return "columns row " + d["model_name"];
      })
      .attr("data-model_name", function(d) {
        return d["model_name"];
      })
      .on("mouseover", function() {
        let mouseOverElement = d3.select(this);
        if (!mouseOverElement.classed("row_highlight")) {
          mouseOverElement.style("background-color", "#9e9e9e");
        }
      })
      .on("mouseout", function() {
        let mouseOutElement = d3.select(this);
        if (!mouseOutElement.classed("row_highlight")) {
          mouseOutElement
            .style("background-color", "transparent")
            .style("color", "#4a4a4a");
        }
      })
      .on("click", function(d, i) {
        rowClicked(this, d, rowColors);
      });
    // .attr("class", "row");

    rows.exit().remove();

    var cells = selection
      .selectAll(".row")
      .selectAll(".cell")
      .data(function(d) {
        return columns.map(function(col) {
          return d[col];
        });
      });

    // cells
    cells
      .enter()
      .append("div")
      .attr("class", function(d, i) {
        return "column is-size-7-desktop col-" + i;
      })
      .attr("data-model_name", function(d) {
        return d["model_name"];
      })
      .classed("cell", true);

    cells.exit().remove();

    selection.selectAll(".cell").text(function(d) {
      return d;
    });

    return dg;
  };

  dg.columns = function(_) {
    if (!arguments.length) return columns;
    columns = _;
    return this;
  };

  return dg;
};