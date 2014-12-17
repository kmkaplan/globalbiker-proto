<div ng-include="'components/navbar/navbar.html'"></div>

<div class="container step-details-page page">

    <ol class="breadcrumb">
        <li><a href="/region/france" translate="mytours.nav-bar_name">Tours</a>
        </li>
        <li class="active">{{ tour.title }}</li>
    </ol>
    <a ng-if="isAllowedToEdit(tour)" class="pull-right" href="/my-tour/{{ tour._id }}">
        <i class="fa fa-edit"></i> {{ 'global.actions.edit' | translate }}
    </a>
    <h1>{{ tour.title }}</h1>
    <div class="alert tour-description" ng-if="tour.description" ng-bind-html="tour.description"></div>

    <div class="row">
        <div class="col-md-12">
            <div class="tour-map-area responsive-map-area  smart-map-area">
                <div extended-map config="tourMapConfig"></div>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <h3>Choisissez une étape</h3>
            <table class="smart-table table table-striped table-hover">
                <tbody>
                    <tr ng-click="openStep(step)" ng-repeat="step in steps">
                        <td>{{ 'tour-details.step' | translate }} {{ $index + 1 }}</td>
                        <td class="main">
                            <span>{{ 'mytours.steps.from' | translate }} {{ step.cityFrom.name }} {{ 'mytours.steps.to' | translate }} {{ step.cityTo.name }}</span>
                        </td>
                        <td class="rating">
                            <rating state-on="'fa fa-bicycle selected'" state-off="'fa fa-bicycle unselected'" readonly="true" ng-model="step.difficulty" max="3"></rating>
                        </td>
                        <td class="rating">
                            <rating state-on="'glyphicon-star selected'" state-off="'glyphicon-star unselected'" readonly="true" ng-model="step.interest" max="5"></rating>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</div>
