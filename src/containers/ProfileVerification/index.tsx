import classnames from 'classnames';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, MapDispatchToPropsFunction } from 'react-redux';
import { Link } from 'react-router-dom';
import { KYC_STEPS } from '../../constants';
import { changeElementPosition } from '../../helpers/changeElementPosition';
import { Label, labelFetch, selectLabelData, selectUserInfo, User } from '../../modules';

/* Icons */
const SuccessIcon = require('../../assets/images/kyc/SuccessIcon.svg');
const PendingIcon = require('../../assets/images/kyc/PendingIcon.svg');
const RejectedIcon = require('../../assets/images/kyc/RejectedIcon.svg');

interface ReduxProps {
    labels: Label[];
}

interface DispatchProps {
    labelFetch: typeof labelFetch;
}

interface ProfileVerificationProps {
    user: User;
}

interface State {
    isMouseTooltipVisible: boolean;
}

type Props =  DispatchProps & ProfileVerificationProps & ReduxProps;

class ProfileVerificationComponent extends React.Component<Props, State> {
    public state = {
        isMouseTooltipVisible: false,
    };

    public componentDidMount() {
        this.props.labelFetch();
    }

    public renderProgressBar(labels: Label[]) {
        const verifiedLabelsCount = labels.length ? (
            labels.filter((label: Label) => KYC_STEPS.includes(label.key) && label.value === 'verified' && label.scope === 'private').length
         ) : 0;
        const progressValue =  `${verifiedLabelsCount / KYC_STEPS.length * 100}%`;
        const filledStyle = progressValue === '100%' ? {width: progressValue} : (
            {
                borderBottomRightRadius: '0',
                borderTopRightRadius: '0',
                width: progressValue,
            }
        );

        return (
            <div className="pg-profile-page-verification__progress-bar">
                <span
                    className="pg-profile-page-verification__progress-bar--filled"
                    style={filledStyle}
                >
                    {verifiedLabelsCount ? progressValue : null}
                </span>
            </div>
        );
    }

    public renderVerificationLabel(labels: Label[], labelToCheck: string, index: number) {
        const { isMouseTooltipVisible } = this.state;
        const targetLabelStatus = this.handleCheckLabel(labels, labelToCheck);

        const tooltipClass = classnames('pg-profile-page-verification__step__tooltip tooltip-hover', {
            'tooltip-hover--visible': isMouseTooltipVisible,
        });

        switch (targetLabelStatus) {
            case 'verified':
                return (
                    <div key={index} className="pg-profile-page-verification__step pg-profile-page-verification__step--verified">
                        <div className="pg-profile-page-verification__step__info">
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.title`} />
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.subtitle`} />
                        </div>
                        <div className="pg-profile-page-verification__step__icon">
                            <img src={SuccessIcon} alt="Success Icon" />
                        </div>
                    </div>
                );
            case 'pending':
                return (
                    <div key={index} className="pg-profile-page-verification__step pg-profile-page-verification__step--pending">
                        <div className="pg-profile-page-verification__step__info">
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.title`} />
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.subtitle`} />
                        </div>
                        <div className="pg-profile-page-verification__step__icon">
                            <FormattedMessage id="page.body.profile.verification.pending" />
                            <img src={PendingIcon} alt="Pending Icon" />
                        </div>
                    </div>
                );
            case 'rejected':
                return (
                    <div key={index} className="pg-profile-page-verification__step pg-profile-page-verification__step--rejected">
                        <div className="pg-profile-page-verification__step__info">
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.title`} />
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.subtitle`} />
                        </div>
                        <div
                            className="pg-profile-page-verification__step__icon"
                            onMouseEnter={e => this.handleHoverTooltipIcon()}
                            onMouseLeave={e => this.handleToggleTooltipVisible()}
                        >
                            <Link to="/confirm">
                                <FormattedMessage id="page.body.profile.verification.reverify" />
                            </Link>
                            <img src={RejectedIcon} alt="Rejected Icon" />
                        </div>
                        <span className={tooltipClass}>
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.rejected.tooltip`} />
                        </span>
                    </div>
                );
            case 'blocked':
                return (
                    <div key={index} className="pg-profile-page-verification__step pg-profile-page-verification__step--blocked">
                        <div className="pg-profile-page-verification__step__info">
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.title`} />
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.subtitle`} />
                        </div>
                        <div className="pg-profile-page-verification__step__button btn btn-primary">
                            <Link to="/confirm"><FormattedMessage id="page.body.profile.verification.verify" /></Link>
                        </div>
                    </div>
                );
            default:
                return (
                    <div key={index} className="pg-profile-page-verification__step pg-profile-page-verification__step--active">
                        <div className="pg-profile-page-verification__step__info">
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.title`} />
                            <FormattedMessage id={`page.body.profile.verification.${labelToCheck}.subtitle`} />
                        </div>
                        <div className="pg-profile-page-verification__step__button btn btn-primary">
                            <Link to="/confirm"><FormattedMessage id="page.body.profile.verification.verify" /></Link>
                        </div>
                    </div>
                );
        }
    }

    public render() {
        const { labels } = this.props;

        return (
            <div className="pg-profile-page__box pg-profile-page-verification">
                <h3 className="pg-profile-page-verification__title">
                    <FormattedMessage id="page.body.profile.header.account.profile" />
                </h3>
                {this.renderProgressBar(labels)}
                {KYC_STEPS.map((step: string, index: number) => this.renderVerificationLabel(labels, step, index))}
            </div>
        );
    }

    private handleCheckLabel = (labels: Label[], labelToCheck: string) => {
        const targetLabel = labels.length && labels.find((label: Label) => label.key === labelToCheck && label.scope === 'private');
        let targetLabelStatus = targetLabel ? targetLabel.value : '';
        const indexOfPrevStep = KYC_STEPS.indexOf(labelToCheck) - 1;

        if (indexOfPrevStep !== -1) {
            const prevStepPassed = Boolean(labels.find((label: Label) => label.key === KYC_STEPS[indexOfPrevStep] && label.value === 'verified' && label.scope === 'private'));

            if (!prevStepPassed) {
                targetLabelStatus = 'blocked';
            }
        }

        return targetLabelStatus;
    };

    private handleToggleTooltipVisible = () => {
        this.setState(prevState => ({
            isMouseTooltipVisible: !prevState.isMouseTooltipVisible,
        }));
    };

    private handleHoverTooltipIcon = () => {
        changeElementPosition('pg-profile-page-verification__step__tooltip', 0, -100, 20);
        this.handleToggleTooltipVisible();
    };
}

const mapStateToProps = state => ({
    user: selectUserInfo(state),
    labels: selectLabelData(state),
});

const mapDispatchProps: MapDispatchToPropsFunction<DispatchProps, {}> =
    dispatch => ({
        labelFetch: () => dispatch(labelFetch()),
    });

export const ProfileVerification = connect(mapStateToProps, mapDispatchProps)(ProfileVerificationComponent);
