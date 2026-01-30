import Colors from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useExplanations } from "@/contexts/explanations";
import { generateText } from "@rork-ai/toolkit-sdk";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronLeft,
  AlertTriangle,
  Maximize2,
  ZoomIn,
  ZoomOut,
  FileText,
  BarChart2,
  CheckSquare,
  Eye,
  Lightbulb,
  List,
  BookOpen,
  Target,
  Layers,
  Settings,
} from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Helper function to clean topic title
const cleanTopicTitle = (title: string): string => {
  return title
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2702}]|[\u{2705}]|[\u{2708}-\u{270D}]|[\u{270F}]|[\u{2712}]|[\u{2714}]|[\u{2716}]|[\u{271D}]|[\u{2721}]|[\u{2728}]|[\u{2733}-\u{2734}]|[\u{2744}]|[\u{2747}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2763}-\u{2764}]|[\u{2795}-\u{2797}]|[\u{27A1}]|[\u{27B0}]|[\u{27BF}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{3030}]|[\u{303D}]|[\u{3297}]|[\u{3299}]/gu, "")
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi, "")
    .replace(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g, "")
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g, "")
    .replace(/\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

// Node colors
const NODE_COLORS = {
  central: { bg: "#1F2937", text: "#FFFFFF" },
  primary: { bg: "#F87171", text: "#FFFFFF" },
  secondary: { bg: "#A78BFA", text: "#FFFFFF" },
  category: { bg: "#6EE7B7", text: "#1F2937" },
  detail: { bg: "#93C5FD", text: "#1F2937" },
};

// Icons for nodes
const NODE_ICONS = [
  FileText, BarChart2, CheckSquare, Eye, Lightbulb,
  List, BookOpen, Target, Layers, Settings,
];

interface MindMapData {
  central: string;
  branches: {
    label: string;
    children: string[];
  }[];
}

interface NodeData {
  id: string;
  label: string;
  type: keyof typeof NODE_COLORS;
  x: number;
  y: number;
  iconIndex: number;
}

interface ConnectionData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

// Generate curve path
const generateCurvePath = (x1: number, y1: number, x2: number, y2: number): string => {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${(y1 + y2) / 2} Q ${midX} ${y2}, ${x2} ${y2}`;
};

// Single Node Component
const NodeView: React.FC<{ node: NodeData }> = ({ node }) => {
  const colors = NODE_COLORS[node.type];
  const Icon = NODE_ICONS[node.iconIndex % NODE_ICONS.length];
  const isCentral = node.type === "central";

  return (
    <View
      style={[
        styles.node,
        isCentral && styles.centralNode,
        { left: node.x, top: node.y, backgroundColor: colors.bg },
      ]}
    >
      <View style={[styles.nodeIcon, isCentral && styles.centralNodeIcon]}>
        <Icon size={isCentral ? 12 : 10} color={colors.text} />
      </View>
      <Text
        style={[styles.nodeLabel, isCentral && styles.centralNodeLabel, { color: colors.text }]}
        numberOfLines={2}
      >
        {node.label}
      </Text>
    </View>
  );
};

export default function MindMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ explanationId?: string; topic?: string }>();
  const { explanations } = useExplanations();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [scale, setScale] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const currentExplanation = params.explanationId
    ? explanations.find((e) => e.id === params.explanationId)
    : null;

  const rawTopic = currentExplanation?.topic || params.topic || "Topic";
  const topic = cleanTopicTitle(rawTopic);
  const content = currentExplanation?.content || "";

  const generateMindMapMutation = useMutation({
    mutationFn: async () => {
      const prompt = `Generate a mind map structure for the topic "${topic}".
${content ? `\nContext:\n${content}\n` : ""}

Return ONLY valid JSON (no markdown):
{
  "central": "Main Topic",
  "branches": [
    {"label": "Concept 1", "children": ["Point A", "Point B"]},
    {"label": "Concept 2", "children": ["Point C", "Point D"]}
  ]
}

Create 4 branches with 2-3 children each. Keep labels SHORT (2-3 words max).`;

      const response = await generateText({
        messages: [{ role: "user", content: prompt }],
      });

      try {
        const cleanedResponse = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleanedResponse) as MindMapData;
      } catch {
        return {
          central: topic,
          branches: [
            { label: "Overview", children: ["Definition", "Purpose"] },
            { label: "Key Points", children: ["Point 1", "Point 2"] },
            { label: "Details", children: ["Detail 1", "Detail 2"] },
            { label: "Summary", children: ["Conclusion", "Next Steps"] },
          ],
        };
      }
    },
    onSuccess: (data) => {
      setMindMapData(data);
      layoutNodes(data);
    },
  });

  const layoutNodes = (data: MindMapData) => {
    const nodeList: NodeData[] = [];
    const connList: ConnectionData[] = [];

    // Canvas dimensions
    const canvasWidth = SCREEN_WIDTH * 2.5;
    const centerX = canvasWidth / 2;
    const startY = 80;

    // Node sizes
    const nodeWidth = 110;
    const nodeHeight = 32;
    const centralWidth = 130;
    const centralHeight = 38;

    // Spacing
    const branchSpacingY = 140;
    const childSpacingY = 50;
    const horizontalGap = 160;

    // Central node
    const centralX = centerX - centralWidth / 2;
    const centralY = startY;
    nodeList.push({
      id: "central",
      label: data.central,
      type: "central",
      x: centralX,
      y: centralY,
      iconIndex: 0,
    });

    const branchTypes: (keyof typeof NODE_COLORS)[] = ["primary", "secondary", "category", "detail"];
    let currentY = centralY + centralHeight + 60;

    // Split branches left/right
    const leftBranches = data.branches.slice(0, Math.ceil(data.branches.length / 2));
    const rightBranches = data.branches.slice(Math.ceil(data.branches.length / 2));

    // Layout left branches
    leftBranches.forEach((branch, idx) => {
      const branchX = centerX - horizontalGap - nodeWidth;
      const branchY = currentY + idx * branchSpacingY;
      const branchType = branchTypes[idx % branchTypes.length];

      nodeList.push({
        id: `left-branch-${idx}`,
        label: branch.label,
        type: branchType,
        x: branchX,
        y: branchY,
        iconIndex: idx + 1,
      });

      // Connection from central to branch
      connList.push({
        x1: centralX + centralWidth / 2,
        y1: centralY + centralHeight,
        x2: branchX + nodeWidth / 2,
        y2: branchY,
        color: NODE_COLORS[branchType].bg,
      });

      // Children
      branch.children.forEach((child, childIdx) => {
        const childX = branchX - horizontalGap;
        const childY = branchY - ((branch.children.length - 1) * childSpacingY) / 2 + childIdx * childSpacingY;

        nodeList.push({
          id: `left-child-${idx}-${childIdx}`,
          label: child,
          type: "detail",
          x: childX,
          y: childY,
          iconIndex: idx * 10 + childIdx + 10,
        });

        connList.push({
          x1: branchX,
          y1: branchY + nodeHeight / 2,
          x2: childX + nodeWidth,
          y2: childY + nodeHeight / 2,
          color: NODE_COLORS[branchType].bg,
        });
      });
    });

    // Layout right branches
    rightBranches.forEach((branch, idx) => {
      const actualIdx = idx + leftBranches.length;
      const branchX = centerX + horizontalGap;
      const branchY = currentY + idx * branchSpacingY;
      const branchType = branchTypes[actualIdx % branchTypes.length];

      nodeList.push({
        id: `right-branch-${idx}`,
        label: branch.label,
        type: branchType,
        x: branchX,
        y: branchY,
        iconIndex: actualIdx + 1,
      });

      // Connection from central to branch
      connList.push({
        x1: centralX + centralWidth / 2,
        y1: centralY + centralHeight,
        x2: branchX + nodeWidth / 2,
        y2: branchY,
        color: NODE_COLORS[branchType].bg,
      });

      // Children
      branch.children.forEach((child, childIdx) => {
        const childX = branchX + nodeWidth + horizontalGap - nodeWidth;
        const childY = branchY - ((branch.children.length - 1) * childSpacingY) / 2 + childIdx * childSpacingY;

        nodeList.push({
          id: `right-child-${idx}-${childIdx}`,
          label: child,
          type: "category",
          x: childX,
          y: childY,
          iconIndex: actualIdx * 10 + childIdx + 20,
        });

        connList.push({
          x1: branchX + nodeWidth,
          y1: branchY + nodeHeight / 2,
          x2: childX,
          y2: childY + nodeHeight / 2,
          color: NODE_COLORS[branchType].bg,
        });
      });
    });

    setNodes(nodeList);
    setConnections(connList);

    // Scroll to center
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: (canvasWidth - SCREEN_WIDTH) / 2,
        y: 0,
        animated: false,
      });
    }, 100);
  };

  useEffect(() => {
    if (!mindMapData && !generateMindMapMutation.isPending) {
      generateMindMapMutation.mutate();
    }
  }, []);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
  const handleFitToScreen = () => {
    setScale(0.8);
    scrollViewRef.current?.scrollTo({
      x: (SCREEN_WIDTH * 2.5 * 0.8 - SCREEN_WIDTH) / 2,
      y: 0,
      animated: true,
    });
  };

  const handleRegenerate = () => {
    setMindMapData(null);
    setNodes([]);
    setConnections([]);
    generateMindMapMutation.mutate();
  };

  // Calculate canvas height based on nodes
  const canvasHeight = Math.max(
    800,
    nodes.length > 0 ? Math.max(...nodes.map((n) => n.y)) + 200 : 800
  );
  const canvasWidth = SCREEN_WIDTH * 2.5;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ChevronLeft size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleRegenerate}>
            <AlertTriangle size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Mind Map */}
        <View style={styles.mapWrapper}>
          {generateMindMapMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1F2937" />
              <Text style={styles.loadingText}>Generating mind map...</Text>
            </View>
          ) : generateMindMapMutation.isError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to generate. Please try again.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRegenerate}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                width: canvasWidth * scale,
                minHeight: canvasHeight * scale,
              }}
              style={styles.scrollView}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: canvasHeight * scale }}
                nestedScrollEnabled
              >
                <View
                  style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    transform: [{ scale }],
                    transformOrigin: "top left",
                  }}
                >
                  {/* SVG Lines */}
                  <Svg
                    width={canvasWidth}
                    height={canvasHeight}
                    style={StyleSheet.absoluteFill}
                  >
                    {connections.map((conn, i) => (
                      <Path
                        key={i}
                        d={generateCurvePath(conn.x1, conn.y1, conn.x2, conn.y2)}
                        stroke={conn.color}
                        strokeWidth={2}
                        fill="none"
                        opacity={0.7}
                      />
                    ))}
                  </Svg>

                  {/* Nodes */}
                  {nodes.map((node) => (
                    <NodeView key={node.id} node={node} />
                  ))}
                </View>
              </ScrollView>
            </ScrollView>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleFitToScreen}>
            <Maximize2 size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
            <ZoomIn size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
            <ZoomOut size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
  mapWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  node: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    width: 110,
    height: 32,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  centralNode: {
    width: 130,
    height: 38,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  nodeIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  centralNodeIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  nodeLabel: {
    flex: 1,
    fontSize: 10,
    fontFamily: Fonts.Medium,
  },
  centralNodeLabel: {
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.Regular,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  bottomControls: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#1F2937",
    justifyContent: "center",
    alignItems: "center",
  },
});
