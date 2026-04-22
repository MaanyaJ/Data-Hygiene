import React from "react";
import { Box, Typography } from "@mui/material";
import RecordCard from "./RecordCard";
import Loader from "./Loader";
import {
  List,
  InfiniteLoader,
  WindowScroller,
  AutoSizer,
} from "react-virtualized";
import "react-virtualized/styles.css";

const RecordList = ({
  records,
  totalRecords,
  countLabel,
  totalPages,
  page,
  loading,
  onLoadMore,
}) => {
  const isRowLoaded = ({ index }) => !!records[index];

  const loadMoreRows = () => {
    if (!loading && page < totalPages) {
      onLoadMore();
    }
    return Promise.resolve();
  };

  const ROW_HEIGHT = 84;
  const getRowHeight = () => ROW_HEIGHT;

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
                    rowHeight={getRowHeight}
                    onRowsRendered={onRowsRendered}
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