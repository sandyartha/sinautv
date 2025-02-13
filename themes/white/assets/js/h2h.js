am4core.addLicense("ch-custom-attribution");

// Load the Rubik font
var link = document.createElement("link");
link.href =
  "https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;900&display=swap";
link.rel = "stylesheet";
document.head.appendChild(link);

// Ambil data dari file JSON
fetch("/h2h.json")
  .then((response) => response.json())
  .then((allData) => {
    var dateKeys = Object.keys(allData); // Get the date keys from the JSON data
    var currentIndex = 0; // Indeks data saat ini

    // Fungsi untuk memperbarui chart
    function updateChart() {
      if (currentIndex < Object.keys(allData).length) {
        chart.data = allData[Object.keys(allData)[currentIndex]];
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }

    am4core.ready(function () {
      // Themes begin
      am4core.useTheme(am4themes_animated);
      // Themes end

      var chart = am4core.create("chartdiv", am4charts.XYChart); // Membuat chart
      chart.padding(40, 40, 40, 40); // Mengatur padding chart, adding extra bottom padding
      chart.svgContainer.width = 1080; // Set canvas width to 2K
      chart.svgContainer.height = 720; // Set canvas height to 2K

      // Set the default font family to Rubik
      chart.fontFamily = "Rubik";

      // Set chart background to transparent
      chart.background.fill = am4core.color("rgba(0, 0, 0, 0)");

      // Set margin for the chart area
      chart.marginTop = 20;
      chart.marginRight = 20;
      chart.marginBottom = 20;
      chart.marginLeft = 20;

      chart.numberFormatter.bigNumberPrefixes = [{ number: 1e3, suffix: "k" }]; // Format angka besar

      var label = chart.plotContainer.createChild(am4core.Label); // Membuat label untuk year
      label.x = am4core.percent(100);
      label.y = am4core.percent(88);
      label.horizontalCenter = "right";
      label.verticalCenter = "middle";
      label.dx = -0;
      label.fontSize = 25; // Adjust font size for year
      label.opacity = 0.5; // Set opacity for the year indicator label
      label.className = "chart-label"; // Tambahkan kelas CSS

      var playButton = chart.plotContainer.createChild(am4core.PlayButton); // Membuat tombol play
      playButton.x = am4core.percent(97);
      playButton.y = am4core.percent(95);
      playButton.dy = -2;
      playButton.verticalCenter = "middle";
      playButton.disabled = true; // Disable the play button

      // Durasi setiap langkah animasi
      // Untuk durasi animasi 30 detik
      // var stepDuration = 30000 / dateKeys.length;

      // Untuk durasi animasi 1 menit
      // var stepDuration = 60000 / dateKeys.length;

      // Untuk durasi animasi 2 menit
      // var stepDuration = 120000 / dateKeys.length;

      // Untuk durasi animasi 5 menit
      // var stepDuration = 300000 / dateKeys.length;

      var stepDuration = 30000 / dateKeys.length;

      var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis()); // Membuat sumbu kategori
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.dataFields.category = "short_name";
      categoryAxis.renderer.minGridDistance = 1;
      categoryAxis.renderer.inversed = true;
      categoryAxis.renderer.grid.template.disabled = true;

      // Adjust padding for categoryY labels
      categoryAxis.renderer.labels.template.padding(10, 10, 10, 10); // top, right, bottom, left

      // Adjust margin from the left side for categoryY labels
      categoryAxis.renderer.marginLeft = -40;

      // Change font size and font weight for short_name labels
      categoryAxis.renderer.labels.template.fontSize = 20;
      categoryAxis.renderer.labels.template.fontWeight = 600;

      var valueAxis = chart.xAxes.push(new am4charts.ValueAxis()); // Membuat sumbu nilai
      valueAxis.min = 0;
      valueAxis.rangeChangeEasing = am4core.ease.linear;
      valueAxis.rangeChangeDuration = stepDuration;
      valueAxis.extraMax = 0.1;

      // Membuat seri kolom untuk "poin"
      var poinSeries = chart.series.push(new am4charts.ColumnSeries());
      poinSeries.dataFields.categoryY = "short_name";
      poinSeries.dataFields.valueX = "poin";
      poinSeries.tooltipText = "{valueX.value}";
      poinSeries.columns.template.strokeOpacity = 0;
      poinSeries.columns.template.column.cornerRadiusBottomRight = 5;
      poinSeries.columns.template.column.cornerRadiusTopRight = 5;
      poinSeries.interpolationDuration = stepDuration;
      poinSeries.interpolationEasing = am4core.ease.linear;
      poinSeries.columns.template.maxWidth = 10; // Mengatur lebar maksimum kolom

      var poinLabelBullet = poinSeries.bullets.push(
        new am4charts.LabelBullet()
      );
      poinLabelBullet.label.horizontalCenter = "right";
      poinLabelBullet.label.text = "{valueX.formatNumber('#')}";
      poinLabelBullet.label.textAlign = "end";
      poinLabelBullet.label.dx = -10;
      poinLabelBullet.label.fill = am4core.color("#FFFFFF"); // Set the color to white
      poinLabelBullet.label.fontSize = 25; // Adjust the font size

      var poinImage = poinLabelBullet.createChild(am4core.Image); // Menambahkan gambar ke label bullet
      poinImage.horizontalCenter = "left";
      poinImage.verticalCenter = "middle";
      poinImage.propertyFields.href = "logo";
      poinImage.dx = 5;
      poinImage.height = 60; // Adjust logo height

      // Define a mapping of label names to custom colors
      var labelColorMapping = {
        LIV: "#c8102E",
        CHE: "#034694",
      };

      // Warna berdasarkan nama label
      poinSeries.columns.template.adapter.add("fill", function (fill, target) {
        var labelName = target.dataItem.categoryY;
        return labelColorMapping[labelName] || fill;
      });

      // Disable initial animation
      poinSeries.defaultState.transitionDuration = 0;
      poinSeries.hiddenState.transitionDuration = 0;

      // Set initial state for labels and columns
      poinLabelBullet.label.text = "";
      poinSeries.columns.template.hiddenState.properties.opacity = 1;
      poinSeries.columns.template.hiddenState.properties.visible = true;

      // Responsive adjustment for mobile screens
      chart.events.on("sizechanged", function (ev) {
        if (ev.target.pixelWidth <= 480) {
          poinSeries.columns.template.maxWidth = 5; // Adjust column width for mobile screens
          poinSeries.columns.template.height = 50; // Adjust column height for mobile screens
          poinLabelBullet.label.fontSize = 20; // Adjust font size for mobile screens
          poinImage.height = 55; // Adjust logo height for mobile screens
          adjustZoomLevel(); // Adjust zoom level for mobile screens

          // Hide labels on mobile
          label.hide();
          leagueLabel.hide();
          scoreLabel.hide();
        } else {
          poinSeries.columns.template.maxWidth = 10; // Default column width for larger screens
          poinImage.height = 60; // Default logo height for larger screens
          categoryAxis.zoom({ start: 0, end: 1 }); // Ensure all bars are visible on larger screens

          // Show labels on larger screens
          label.show();
          leagueLabel.show();
          scoreLabel.show();
        }
      });

      // Function to adjust zoom level based on items with non-zero values
      function adjustZoomLevel() {
        var itemsWithNonZero = chart.data.filter(
          (item) => item.poin > 0
        ).length;
        categoryAxis.zoom({
          start: 0,
          end: itemsWithNonZero / categoryAxis.dataItems.length,
        });
      }

      // Adapter untuk memastikan angka bulat dari 3.49293 ke 3
      poinLabelBullet.label.adapter.add("text", function (text, target) {
        return target.dataItem
          ? Math.round(target.dataItem.valueX).toString()
          : text;
      });

      var year = dateKeys[currentIndex]; // Initialize with the first date key
      label.text = year;

      // Update year, league, and score in separate divs
      document.getElementById("yearDiv").innerText = year;

      var leagueLabel = chart.plotContainer.createChild(am4core.Label); // Membuat label untuk league
      leagueLabel.x = am4core.percent(100);
      leagueLabel.y = am4core.percent(91);
      leagueLabel.horizontalCenter = "right";
      leagueLabel.verticalCenter = "middle";
      leagueLabel.dx = -0;
      leagueLabel.fontSize = 20; // Adjust font size for league
      leagueLabel.dy = 10; // Adjust the position below the year indicator
      leagueLabel.opacity = 0.5; // Set opacity for the league label
      leagueLabel.className = "chart-label"; // Tambahkan kelas CSS

      var scoreLabel = chart.plotContainer.createChild(am4core.Label); // Membuat label untuk score
      scoreLabel.x = am4core.percent(100); // Set the x position of the label
      scoreLabel.y = am4core.percent(94);
      scoreLabel.horizontalCenter = "right";
      scoreLabel.verticalCenter = "middle";
      scoreLabel.dx = -0;
      scoreLabel.fontSize = 20; // Adjust font size for score
      scoreLabel.dy = 20; // Adjust the position below the league label
      scoreLabel.opacity = 0.5; // Set opacity for the score label
      scoreLabel.className = "chart-label"; // Tambahkan kelas CSS

      var interval; // Variabel untuk interval animasi

      // Fungsi untuk memulai animasi charts
      function play() {
        interval = setInterval(function () {
          nextYear();
        }, stepDuration);
        nextYear();
      }

      // Fungsi untuk menghentikan animasi chart
      function stop() {
        if (interval) {
          clearInterval(interval);
        }
      }

      // Fungsi untuk memperbarui data chart ke tahun berikutnya
      function nextYear() {
        currentIndex++;

        if (currentIndex >= dateKeys.length) {
          return;
        }

        var newData = allData[dateKeys[currentIndex]];
        var itemsWithNonZero = 1;
        for (var i = 0; i < chart.data.length; i++) {
          chart.data[i].poin = newData[i].poin;
          if (chart.data[i].poin > 0) {
            itemsWithNonZero++;
          }
        }

        if (currentIndex > 36) {
          poinSeries.interpolationDuration = stepDuration * 4;
          valueAxis.rangeChangeDuration = stepDuration * 4;
        } else {
          poinSeries.interpolationDuration = stepDuration;
          valueAxis.rangeChangeDuration = stepDuration;
        }

        chart.invalidateRawData();
        year = dateKeys[currentIndex];
        label.text = year;

        // Update year, league, and score in separate divs
        document.getElementById("yearDiv").innerText = year; // Pastikan elemen yearDiv diperbarui

        var leagues = newData.map((item) => item.league || "").join(" ");
        leagueLabel.text = leagues;
        document.getElementById("leagueDiv").innerText = leagues;

        var scores = newData
          .filter((item) => item.score)
          .map((item) => "Score: " + item.score)
          .join(" ");
        scoreLabel.text = scores;
        document.getElementById("scoreDiv").innerText = scores;

        adjustZoomLevel(); // Adjust zoom level after updating data

        // Log untuk debugging
        console.log("Year:", year);
        console.log("Chart Data:", chart.data);
      }

      categoryAxis.sortBySeries = poinSeries;

      // Initialize chart with all bars visible
      chart.data = JSON.parse(JSON.stringify(allData[dateKeys[currentIndex]]));
      categoryAxis.zoom({ start: 0, end: 1 });

      // Log untuk debugging
      console.log("Initial Chart Data:", chart.data);

      // Hide the zoom out button
      chart.zoomOutButton.disabled = true;

      poinSeries.events.on("inited", function () {
        setTimeout(function () {
          play(); // Start the animation automatically
        }, 2000);
      });

      // Update zoom level when data changes
      categoryAxis.events.on("datavalidated", function () {
        adjustZoomLevel();
      });

      // Tambahkan teks statis "dango ball" di pojok kanan atas area bar chart
      var staticText = chart.plotContainer.createChild(am4core.Label);
      staticText.text = "dango ball";
      staticText.fontSize = 15;
      staticText.align = "right";
      staticText.valign = "top";
      staticText.opacity = 0.2; // Set opacity for the score label
      staticText.dx = -10;
      staticText.dy = 10;
      staticText.fill = am4core.color("#000000"); // Warna teks hitam

      // am4core.options.commercialWatermark.fontSize = 20; // Adjust watermark font size
      // am4core.options.commercialWatermark.height = 2; // Adjust watermark image height
    });
  })
  .catch((error) => console.error("Error loading data:", error));
