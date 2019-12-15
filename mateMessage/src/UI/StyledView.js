import React from 'react';
import {
    space,
    color,
    flex,
    height,
    width,
    flexDirection,
    justifyContent,
    compose,
} from 'styled-system';
import styled from '@emotion/native';

const StyledView = styled.View(
    compose(space, color, flex, height, width, flexDirection, justifyContent),
);

export default StyledView;