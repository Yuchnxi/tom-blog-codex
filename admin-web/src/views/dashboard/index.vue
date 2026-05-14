<template>
  <section class="dashboard-page">
    <div class="stats-grid dashboard-stats">
      <article v-for="item in stats" :key="item.label" class="stat-card">
        <span class="stat-label">{{ item.label }}</span>
        <strong class="stat-value">{{ item.value }}</strong>
        <span class="stat-icon">
          <component :is="item.icon" />
        </span>
      </article>
    </div>

    <div class="dashboard-charts">
      <section class="panel chart-panel">
        <div class="chart-header">
          <div>
            <h3>文章阅读量排行</h3>
            <p>按累计阅读量展示前 10 篇文章</p>
          </div>
        </div>
        <div v-if="loading" class="chart-state">数据加载中...</div>
        <div v-else-if="!topArticles.length" class="chart-state">暂无访问数据</div>
        <div v-show="!loading && topArticles.length" ref="rankChartRef" class="chart-box"></div>
      </section>

      <section class="panel chart-panel">
        <div class="chart-header">
          <div>
            <h3>内容概览</h3>
            <p>已发布与草稿占比</p>
          </div>
        </div>
        <div v-if="loading" class="chart-state">数据加载中...</div>
        <div v-else-if="!hasPublishData" class="chart-state">暂无文章数据</div>
        <div v-show="!loading && hasPublishData" ref="statusChartRef" class="chart-box"></div>
      </section>
    </div>
  </section>
</template>

<script setup>
import * as echarts from 'echarts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { Collection, DataAnalysis, DocumentChecked, EditPen, View } from '@element-plus/icons-vue';
import { getDashboardStats } from '../../api/dashboard';

const loading = ref(false);
const overview = ref({
  totalArticles: 0,
  publishedArticles: 0,
  draftArticles: 0,
  totalViews: 0,
  totalVisitors: 0,
});
const topArticles = ref([]);
const publishStatus = ref([]);
const rankChartRef = ref(null);
const statusChartRef = ref(null);
let rankChart = null;
let statusChart = null;

const stats = computed(() => [
  { label: '文章总数', value: formatNumber(overview.value.totalArticles), icon: Collection },
  { label: '已发布', value: formatNumber(overview.value.publishedArticles), icon: DocumentChecked },
  { label: '草稿', value: formatNumber(overview.value.draftArticles), icon: EditPen },
  { label: '总阅读量', value: formatNumber(overview.value.totalViews), icon: View },
  { label: '总访客数', value: formatNumber(overview.value.totalVisitors), icon: DataAnalysis },
]);
const hasPublishData = computed(() => publishStatus.value.some((item) => item.value > 0));

function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN');
}

function buildRankOption() {
  const articles = [...topArticles.value].reverse();

  return {
    grid: { top: 14, right: 28, bottom: 18, left: 86 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter(params) {
        const item = params[0];
        const article = articles[item.dataIndex];
        return `${article.title}<br/>阅读量：${formatNumber(article.view_count)}<br/>访客数：${formatNumber(article.visitor_count)}`;
      },
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#edf0f3' } },
    },
    yAxis: {
      type: 'category',
      data: articles.map((item) => item.title),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#57606a',
        width: 76,
        overflow: 'truncate',
      },
    },
    series: [
      {
        name: '阅读量',
        type: 'bar',
        data: articles.map((item) => item.view_count || 0),
        barWidth: 14,
        itemStyle: {
          borderRadius: [ 0, 8, 8, 0 ],
          color: '#d4af37',
        },
      },
    ],
  };
}

function buildStatusOption() {
  return {
    color: [ '#2da44e', '#bf8700' ],
    tooltip: { trigger: 'item' },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#57606a' },
    },
    series: [
      {
        name: '内容状态',
        type: 'pie',
        radius: '66%',
        center: [ '50%', '48%' ],
        avoidLabelOverlap: true,
        label: {
          position: 'inside',
          formatter(params) {
            if (!params.value) {
              return '';
            }
            return `${params.name}\n${params.value} 篇`;
          },
          color: '#fff',
          fontWeight: 700,
          lineHeight: 18,
        },
        labelLine: { show: false },
        data: publishStatus.value,
      },
    ],
  };
}

function renderCharts() {
  if (topArticles.value.length && rankChartRef.value) {
    rankChart = rankChart || echarts.init(rankChartRef.value);
    rankChart.setOption(buildRankOption());
  }

  if (hasPublishData.value && statusChartRef.value) {
    statusChart = statusChart || echarts.init(statusChartRef.value);
    statusChart.setOption(buildStatusOption());
  }
}

async function loadData() {
  loading.value = true;
  try {
    const data = await getDashboardStats();
    overview.value = data?.overview || overview.value;
    topArticles.value = data?.topArticles || [];
    publishStatus.value = data?.publishStatus || [];
    loading.value = false;
    await nextTick();
    renderCharts();
  } finally {
    loading.value = false;
  }
}

function resizeCharts() {
  rankChart?.resize();
  statusChart?.resize();
}

onMounted(() => {
  loadData();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  rankChart?.dispose();
  statusChart?.dispose();
});
</script>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 24px;
}

.dashboard-stats {
  margin-bottom: 0;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.85fr);
  gap: 20px;
}

.chart-panel {
  display: grid;
  min-height: 420px;
  align-content: start;
  gap: 18px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.chart-header h3 {
  margin: 0;
  color: var(--text-main);
  font-size: 18px;
  font-weight: 750;
}

.chart-header p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.chart-box {
  width: 100%;
  height: 340px;
}

.chart-state {
  display: grid;
  min-height: 340px;
  place-items: center;
  border: 1px dashed var(--line);
  border-radius: 8px;
  color: var(--text-muted);
  background: #fbfcfd;
}

@media (max-width: 1180px) {
  .dashboard-charts {
    grid-template-columns: 1fr;
  }
}
</style>
