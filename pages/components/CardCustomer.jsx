import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PersonIcon from "@mui/icons-material/Person";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} size="large" />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const user_photo = "/assets/images/dani_4.jpg";

export default function CardCustomer() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const StyledCard = styled(Card)({
    // Set a minimum height for the card to ensure content is visible
    minHeight: "200px", // Adjust the minimum height as needed
  });

  return (
    <StyledCard>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="customer">
            <PersonIcon />
          </Avatar>
        }
        action={
          <IconButton aria-label="settings" size="large">
            <MoreVertIcon />
          </IconButton>
        }
        title="Customer Information"
        subheader="September 14, 2016"
      />
      <CardMedia component="img" image={user_photo} alt="Customer info" />
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites" size="large">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share" size="large">
          <ShareIcon />
        </IconButton>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>
            Extended Information about the customer:
          </Typography>
          <Typography paragraph style={{ color: "green" }}>
            - Holds 9 policies with us, of which 2 are active.
          </Typography>
          <Typography paragraph style={{ color: "red" }}>
            - 1 pending invoice with a total amount of 17.453€.
          </Typography>
          <Typography paragraph style={{ color: "red" }}>
            - 1 open claim amounting to 8.256€.
          </Typography>
          <Typography>Additional Information.</Typography>
        </CardContent>
      </Collapse>
    </StyledCard>
  );
}
