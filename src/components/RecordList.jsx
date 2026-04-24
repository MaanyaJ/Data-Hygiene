import React, { useState, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import RecordCard from "./RecordCard";
import Loader from "./Loader";
import {
  List,
  InfiniteLoader,
  WindowScroller,
  AutoSizer,
} from "react-virtualized";
import "react-virtualized/styles.css";
import { useVisibleIds } from "../hooks/useVisibleIds";
import { useProgressPolling } from "../hooks/useProgressPolling";

const RecordList = ({
  records,
  totalRecords,
  totalPages,
  page,
  loading,
  onLoadMore,
  patchRecords,
  isReady,
  extraParams,
}) => {
  const [visibleIds, setVisibleIds] = useState([]);

  const { handleRowsRendered: handleVisibleRange } = useVisibleIds({
    records,
    onVisibleIdsChange: setVisibleIds,
  });

  useProgressPolling({
    visibleIds,
    patchRecords,
    isReady: isReady.current,
    extraParams,
  });

  // Clear stale IDs when the record list becomes empty (e.g. after a filter change)
  // so the polling hook doesn't keep firing batch calls for the previous page's records
  useEffect(() => {
    if (records.length === 0) {
      setVisibleIds([]);
    }
  }, [records.length]);

  const isRowLoaded = ({ index }) => !!records[index];

  const loadMoreRows = () => {
    if (!loading && page < totalPages) onLoadMore();
    return Promise.resolve();
  };

  const ROW_HEIGHT = 84;

  const rowRenderer = ({ index, key, style }) => {
    const record = records[index];
    if (!record) {
      return (
        <div key={key} style={style}>
          <Loader />
        </div>
      );
    }
    return (
      <div key={key} style={style}>
        <RecordCard record={record} index={index} />
      </div>
    );
  };

  if (loading && records.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box>
      <InfiniteLoader
        isRowLoaded={isRowLoaded}
        loadMoreRows={loadMoreRows}
        rowCount={totalRecords}
        threshold={5}
      >
        {({ onRowsRendered, registerChild }) => (
          <WindowScroller>
            {({ height, isScrolling, scrollTop }) => (
              <AutoSizer disableHeight>
                {({ width }) => (
                  <List
                    autoHeight
                    height={height}
                    width={width}
                    scrollTop={scrollTop}
                    isScrolling={isScrolling}
                    rowCount={records.length}
                    rowHeight={ROW_HEIGHT}
                    onRowsRendered={(info) => {
                      onRowsRendered(info);     // InfiniteLoader's handler
                      handleVisibleRange(info); // our polling handler
                    }}
                    ref={registerChild}
                    rowRenderer={rowRenderer}
                    overscanRowCount={4}
                  />
                )}
              </AutoSizer>
            )}
          </WindowScroller>
        )}
      </InfiniteLoader>

      {loading && records.length > 0 && (
        <Box sx={{ textAlign: "center", py: 2, borderTop: "1px solid #e8e8e8" }}>
          <Loader />
        </Box>
      )}
    </Box>
  );
};

export default RecordList;